import { getType, checkType } from "./values.js";
import { Func } from "./func.js";
import { checkIndex } from "./list.js";
import { checkKey } from "./obj.js";
import { checkNumResult, checkWhole } from "./num.js";
import { show } from "./repr.js";
import { getImport } from "./import.js";
import { Panic } from "./panic.js";
import { dirname } from "node:path";
import { is, OrderedMap, OrderedSet, List, Repeat } from "immutable";

export class Returner {
  constructor(value) {
    this.value = value;
  }
}

export class Env {
  constructor(parent, defs) {
    this.parent = parent;
    this.defs = defs;
    // used to evaluate compound assignments
    // for example: `x += 1` gets transformed into `x = prev + 1`
    // and 1 gets pushed to `prev` before the definition is evaluated
    this.prev = [];
    this.blameLocs = [];
  }

  spawn(defs = new Map()) {
    return new Env(this, defs);
  }

  setBlame(loc) {
    this.blameLocs[this.blameLocs.length - 1] = loc;
  }

  // evaluate each node and return the value of the last one,
  // checking type if specified
  async evalLoc(nodes, loc, ...types) {
    if (!(nodes instanceof Array)) {
      nodes = [nodes];
    }

    // empty nodes block returns none (null)
    let result = null;

    for (const [index, node] of nodes.entries()) {
      try {
        this.blameLocs.push(null);
        result = await this.dispatch(node);

        if (index === nodes.length - 1) {
          checkType(result, ...types);
        }
      } catch (err) {
        if (err instanceof Panic) {
          err.setLoc(this.blameLocs.at(-1) ?? loc ?? node.loc);
        }

        throw err;
      } finally {
        this.blameLocs.pop();
      }
    }

    return result;
  }

  async eval(nodes, ...types) {
    return await this.evalLoc(nodes, undefined, ...types);
  }

  // evaluate each node and return a list of results
  async evalEach(nodes) {
    const results = [];

    for (const node of nodes) {
      results.push(await this.eval(node));
    }

    return results;
  }

  setDef(name, value) {
    this.defs.set(name, value);
  }

  lookup(name) {
    let env = this;

    while (env) {
      if (env.defs.has(name)) {
        return env.defs.get(name);
      }

      env = env.parent;
    }

    throw new Panic("name is not defined", { $name: name });
  }

  async dispatch(node) {
    switch (node.type) {
      case "bool":
      case "none":
      case "number":
      case "string":
        return node.value;
      case "fmtString":
        return this.evalFmtString(node);
      case "unaryOp":
        return this.evalUnaryOp(node);
      case "binaryOp":
        return this.evalBinaryOp(node);
      case "name":
        return await this.lookup(node.value);
      case "def":
        return this.evalDef(node);
      case "prev":
        return this.prev.at(-1);
      case "call":
        return this.evalCall(node);
      case "pipe":
        return this.evalPipe(node);
      case "map":
        return this.evalMap(node);
      case "filter":
        return this.evalFilter(node);
      case "fn":
        return this.evalFn(node);
      case "return":
        throw new Returner(await this.eval(node.value));
      case "if":
        return this.evalIf(node);
      case "for":
        return this.evalFor(node);
      case "tandemFor":
        return this.evalTandemFor(node);
      case "anonFor":
        return this.evalAnonFor(node);
      case "while":
        return this.evalWhile(node);
      case "list":
        return List(await this.evalEach(node.value));
      case "set":
        return OrderedSet(await this.evalEach(node.value));
      case "object":
        return this.evalObject(node);
      case "access":
        return this.evalAccess(node);
      case "import":
        return await getImport(dirname(node.loc.path), node.value);
      default:
        throw new Error("node.type: " + node.type);
    }
  }

  async evalFmtString(node) {
    const { fragments, fmtNodes } = node.value;

    let result = fragments[0];

    for (const [index, fragment] of fragments.slice(1).entries()) {
      const fmtValue = await this.eval(fmtNodes[index]);
      result += show(fmtValue) + fragment;
    }

    return result;
  }

  async evalUnaryOp(node) {
    const { op, rhs } = node.value;
    const value = await this.eval(rhs);

    switch (op) {
      case "-":
        return -checkType(value, "number");
      case "not":
        return !checkType(value, "boolean");
      default:
        throw new Error("op: " + op);
    }
  }

  async evalBinaryOp(node) {
    const { op, lhs, rhs } = node.value;

    switch (op) {
      case "and":
        return (
          (await this.eval(lhs, "boolean")) && (await this.eval(rhs, "boolean"))
        );
      case "or":
        return (
          (await this.eval(lhs, "boolean")) || (await this.eval(rhs, "boolean"))
        );
    }

    const a = await this.eval(lhs);
    const b = await this.eval(rhs);

    switch (op) {
      case "==":
        return is(a, b);
      case "!=":
        return !is(a, b);
      case "+": {
        const typeA = getType(a);
        checkType(b, typeA);

        switch (typeA) {
          case "string":
            return a + b;
          case "list":
          case "object":
          case "set":
          case "table":
            return a.concat(b);
        }

        break;
      }
      case "*": {
        switch (getType(a)) {
          case "string":
            checkType(b, "number");
            checkWhole(b);
            return a.repeat(b);
          case "list":
            checkType(b, "number");
            checkWhole(b);
            return List(Repeat(a, b)).flatten(true);
        }
      }
    }

    checkType(a, "number");
    checkType(b, "number");

    // checkNumResult catches over/under-flow, 0 ** 0, n / 0, and n % 0
    switch (op) {
      case "+":
        return checkNumResult(a + b, a, b);
      case "-":
        return checkNumResult(a - b, a, b);
      case "*":
        return checkNumResult(a * b, a, b);
      case "/":
        return checkNumResult(a / b, a, b);
      case "**":
        return checkNumResult(a ** b, a, b);
      case "%":
        // https://en.wikipedia.org/wiki/Modulo#Variants_of_the_definition
        // Floor mod (works better for some algorithms like eucliden gcd)
        return checkNumResult(((a % b) + b) % b, a, b);
      case "<":
        return a < b;
      case "<=":
        return a <= b;
      case ">":
        return a > b;
      case ">=":
        return a >= b;
      default:
        throw new Error("op: " + op);
    }
  }

  async sliceKeys(keys) {
    // each key gets evaluated only once, even though it's used for both
    // getting the old value (for compound assignments) and setting the new one
    const key = await this.eval(keys[0]);
    const newKeys = keys.slice(1);
    return { key, newKeys };
  }

  async updateList(list, keys, isCompound, rhs) {
    const { key, newKeys } = await this.sliceKeys(keys);
    checkIndex(list, key);
    const child = list.get(key);
    const updated = await this.update(child, newKeys, isCompound, rhs);
    return list.set(key, updated);
  }

  async updateObject(object, keys, isCompound, rhs) {
    const { key, newKeys } = await this.sliceKeys(keys);

    // check that object[key] exists if key is an intermediate key (not the last)
    // for example, in `foo.bar.baz = 0`, the key `bar` must already exist in
    // `foo`, but `baz` does not need to exist in `foo.bar` yet, unless this is a
    // compound assignment in which every key must exist (to get the current value)
    if (newKeys.length || isCompound) {
      checkKey(object, key);
    }

    // child will be undefined for the final key when assignment is not compound,
    // but it's ok in that case since there's no prev node to access it
    const child = object.get(key);
    const updated = await this.update(child, newKeys, isCompound, rhs);
    return object.set(key, updated);
  }

  async updateTable(table, keys, isCompound, rhs) {
    const { key, newKeys } = await this.sliceKeys(keys);
    checkType(key, "number", "string", "object");

    let child;

    if (newKeys.length || isCompound) {
      child = table.get(key);
    }

    const updated = await this.update(child, newKeys, isCompound, rhs);

    // set blame for invalid/mismatched column(s)
    this.setBlame(rhs.loc);
    return table.set(key, updated);
  }

  // recursively update a nested structure
  //
  // example:
  //   items[i].quantity += 1
  //
  // gets converted by the parser into:
  //   items[i].quantity = prev + 1
  //
  // gets interpreted by `update` as something like this:
  //   prev = items[i].quantity
  //   items = obj.set(items, i, list.set(items[i], "quantity", prev + 1))

  async update(container, keys, isCompound, rhs) {
    if (!keys.length) {
      // prev is set to the nested value, not the top-level container
      // for example, in `foo[i] = prev + 1`, prev is `foo[i]`, not `foo`
      this.prev.push(container);
      const result = await this.eval(rhs);
      this.prev.pop();
      return result;
    }

    checkType(container, "list", "object", "table");

    // try {
    //
    // } catch (err) {
    //   err.setLoc?.(keys[0].loc);
    //   throw err;
    // }

    // since we evaluate the keys outside of the normal syntax tree
    // traversal we need to manually specify the loc for error traces
    this.setBlame(keys[0].loc);

    switch (getType(container)) {
      case "list":
        return this.updateList(container, keys, isCompound, rhs);
      case "object":
        return this.updateObject(container, keys, isCompound, rhs);
      case "table":
        return this.updateTable(container, keys, isCompound, rhs);
    }
  }

  async evalDef(node) {
    const { name, keys, isCompound, rhs } = node.value;

    if (!keys.length) {
      this.prev.push(isCompound ? await this.lookup(name) : undefined);
      this.setDef(name, await this.eval(rhs));
      this.prev.pop();
    } else {
      const container = await this.lookup(name);
      this.setDef(name, await this.update(container, keys, isCompound, rhs));
    }

    return null;
  }

  async evalCall(node) {
    const { func: funcNode, args: argNodes } = node.value;
    const func = await this.eval(funcNode, "function");
    const args = await this.evalEach(argNodes);
    return await func.call(...args);
  }

  async evalPipe(node) {
    const { lhs: lhsNode, args: argNodes, func: funcNode } = node.value;
    const lhs = await this.eval(lhsNode);
    const func = await this.eval(funcNode, "function");
    const args = await this.evalEach(argNodes);
    return await func.call(lhs, ...args);
  }

  async evalMap(node) {
    const { lhs, args: argNodes, func: funcNode } = node.value;
    // use operator loc for type errors, gets confusing otherwise
    // if it makes it look like error came from expression on previous line
    const iter = await this.evalLoc(lhs, node.loc, "list", "table");

    if (!iter.size) {
      return iter;
    }

    const args = await this.evalEach(argNodes);
    const func = await this.eval(funcNode, "function");
    const elems = [];

    for (const elem of iter) {
      elems.push(await func.call(elem, ...args));
    }

    return List(elems);
  }

  async evalFilter(node) {
    const { lhs, args: argNodes, func: funcNode } = node.value;
    // use operator loc for type errors, gets confusing otherwise
    // if it makes it look like error came from expression on previous line
    const iter = await this.evalLoc(lhs, node.loc, "list", "table");

    if (!iter.size) {
      return iter;
    }

    const args = await this.evalEach(argNodes);
    const func = await this.eval(funcNode, "function");

    if (getType(iter) === "table") {
      return await iter.filter(func);
    }

    const elems = [];

    for (const elem of iter) {
      if (await func.callCondition(elem, ...args)) {
        elems.push(elem);
      }
    }

    return List(elems);
  }

  evalFn(node) {
    const { name, params, body } = node.value;

    const handler = async (...args) => {
      const defs = new Map(params.map((param, index) => [param, args[index]]));
      const env = this.spawn(defs);

      try {
        return await env.eval(body);
      } catch (err) {
        if (err instanceof Returner) {
          return err.value;
        }

        // only calls when pushContext method is defined
        // (when err is a ptls panic)
        err.pushContext?.(context);
        throw err;
      }
    };

    const fn = new Func(handler, name, params);
    // handler captures context for error traces
    const context = String(fn);
    return fn;
  }

  async evalIf(node) {
    const { cases, fallback } = node.value;

    for (const { cond, body } of cases) {
      if (await this.eval(cond, "boolean")) {
        return await this.eval(body);
      }
    }

    return await this.eval(fallback);
  }

  async evalFor(node) {
    // TO DO: address loop closure scope issue
    const { name, range: rangeNode, body } = node.value;
    let range = await this.eval(rangeNode, "list", "table", "object", "set");

    if (getType(range) === "object") {
      for (const key of range.keys()) {
        this.setDef(name, key);
        await this.eval(body);
      }
    } else {
      for (const value of range) {
        this.setDef(name, value);
        await this.eval(body);
      }
    }

    return null;
  }

  async evalTandemFor(node) {
    // TO DO: address loop closure scope issue
    const { keyName, valName, range: rangeNode, body } = node.value;
    let range = await this.eval(rangeNode, "list", "table", "object", "set");

    if (getType(range) === "object") {
      for (const [key, value] of range) {
        this.setDef(keyName, key);
        this.setDef(valName, value);
        await this.eval(body);
      }
    } else {
      for (const [index, value] of range.entries()) {
        this.setDef(keyName, index);
        this.setDef(valName, value);
        await this.eval(body);
      }
    }

    return null;
  }

  async evalAnonFor(node) {
    const { range: rangeNode, body } = node.value;
    const range = await this.eval(rangeNode, "number");
    this.setBlame(rangeNode.loc);
    checkWhole(range);

    for (let n = 0; n < range; n++) {
      await this.eval(body);
    }

    return null;
  }

  async evalWhile(node) {
    const { cond, body } = node.value;

    while (await this.eval(cond, "boolean")) {
      await this.eval(body);
    }

    return null;
  }

  async evalObject(node) {
    const map = new Map();

    for (const { key: keyNode, value: valueNode } of node.value) {
      const key = await this.eval(keyNode);
      map.set(key, await this.eval(valueNode));
    }

    return OrderedMap(map);
  }

  async evalAccess(node) {
    const { lhs: lhsNode, rhs: rhsNode } = node.value;
    const lhs = await this.eval(lhsNode, "list", "object", "table");
    const rhs = await this.eval(rhsNode);

    switch (getType(lhs)) {
      case "list":
        this.setBlame(rhsNode.loc);
        checkIndex(lhs, rhs);
        return lhs.get(rhs);

      case "object":
        this.setBlame(rhsNode.loc);
        checkKey(lhs, rhs);
        return lhs.get(rhs);

      case "table":
        return lhs.get(rhs);
    }
  }
}
