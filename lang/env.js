import { checkType, getType } from "./values.js";
import { Func } from "./func.js";
import { checkIndex } from "./list.js";
import { checkKey } from "./obj.js";
import { Table } from "./table.js";
import { checkNumResult, checkWhole } from "./num.js";
import { repr } from "./repr.js";
import { Panic } from "./panic.js";
import im from "../immutable/immutable.js";

export class Returner {
  constructor(value) {
    this.value = value;
  }
}

class Breaker {}
class Continuer {}

export class Env {
  constructor(parent, defs, runtime) {
    this.parent = parent;
    this.defs = defs;
    this.runtime = runtime;
    // used to evaluate compound assignments
    // for example: `x += 1` gets transformed into `x = prev + 1`
    // and 1 gets pushed to `prev` before the definition is evaluated
    this.prev = [];
    this.blameLocs = [];
  }

  spawn(defs = new Map()) {
    return new Env(this, defs, this.runtime);
  }

  snapshot() {
    // Make anon functions capture snapshot of parent env. This way they
    // aren't self-referential and can be handled by simple reference
    // counting. Named functions that can reference themselves can only
    // be declared at top level not in loops or other functions. Not
    // relavant now but important semantics for optimization later on.
    // Also fixes issue of closing over loop variables in for loops.

    const allDefs = [];
    // deno-lint-ignore no-this-alias
    let env = this;

    while (env) {
      allDefs.push(env.defs);
      env = env.parent;
    }

    const entries = allDefs
      .toReversed()
      .map((defs) => [...defs])
      .flat();

    return new Env(null, new Map(entries), this.runtime);
  }

  setBlame(loc) {
    this.blameLocs[this.blameLocs.length - 1] = loc;
  }

  // evaluate each node and return the value of the last one,
  // checking type if specified
  async evalLoc(nodes, loc, ...types) {
    if (this.runtime.halted) {
      throw new Panic("halted");
    }

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
    // deno-lint-ignore no-this-alias
    let env = this;

    while (env) {
      if (env.defs.has(name)) {
        return env.defs.get(name);
      }

      env = env.parent;
    }

    throw new Panic("variable is not defined", { $name: name });
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
      case "dateTime":
        return this.evalDateTime(node);
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
      case "break":
        throw new Breaker();
      case "continue":
        throw new Continuer();
      case "return":
        throw new Returner(await this.eval(node.value));
      case "if":
        return this.evalIf(node);
      case "match":
        return this.evalMatch(node);
      case "for":
        return this.evalFor(node);
      case "tandemFor":
        return this.evalTandemFor(node);
      case "anonFor":
        return this.evalAnonFor(node);
      case "while":
        return this.evalWhile(node);
      case "list":
        return im.List(await this.evalEach(node.value));
      case "set":
        return im.OrderedSet(await this.evalEach(node.value));
      case "object":
        return this.evalObject(node);
      case "table":
        return this.evalTable(node);
      case "access":
        return this.evalAccess(node);
      case "import":
        return await this.runtime.importer.get(node.loc.path, node.value);
      default:
        throw new Error("node.type: " + node.type);
    }
  }

  async evalFmtString(node) {
    const { fragments, fmtNodes } = node.value;

    let result = fragments[0];

    for (const [index, fragment] of fragments.slice(1).entries()) {
      const fmtValue = await this.eval(fmtNodes[index]);
      result += repr(fmtValue, "normal", true) + fragment;
    }

    return result;
  }

  evalDateTime(_node) {
    // const inner = node.value;
    throw new Panic("unimplemented");
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
      case "??": {
        if (lhs.type === "access") {
          const { lhs: objNode, rhs: keyNode } = lhs.value;
          const obj = await this.eval(objNode, "object");
          const key = await this.eval(keyNode);
          return obj.has(key) ? obj.get(key) : await this.eval(rhs);
        }

        const maybeNone = await this.eval(lhs);
        return getType(maybeNone) === "none" ? await this.eval(rhs) : maybeNone;
      }
    }

    const a = await this.eval(lhs);
    const b = await this.eval(rhs);

    switch (op) {
      case "==":
        return im.is(a, b);
      case "!=":
        return !im.is(a, b);
      case "in":
        checkType(b, "list", "set", "object", "string", "table");
        switch (getType(b)) {
          case "list":
            return b.includes(a);
          case "set":
            return b.has(a);
          case "object":
            return b.has(a);
          case "string":
            checkType(a, "string");
            return b.includes(a);
          case "table":
            return b.has(a);
        }

        break;
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
          case "number":
            if (getType(b) === "string") {
              checkType(a, "number");
              checkWhole(a);
              return b.repeat(Math.max(0, a));
            }

            break;
          case "string":
            checkType(b, "number");
            checkWhole(b);
            return a.repeat(Math.max(0, b));
          case "list":
            checkType(b, "number");
            checkWhole(b);
            return im.List(im.Repeat(a, b)).flatten(true);
        }

        break;
      }
      case "<":
      case "<=":
      case ">":
      case ">=":
        if (getType(a) === "string") {
          checkType(b, "string");
          switch (op) {
            case "<":
              return a < b;
            case "<=":
              return a <= b;
            case ">":
              return a > b;
            case ">=":
              return a >= b;
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
      case "//":
        return checkNumResult(Math.floor(a / b), a, b);
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

    // Check that object[key] exists if either:
    //
    //   A. The key is an intermediate key (not the last):
    //
    //      -- The key `bar` must already exist in `foo`, but `baz` does not
    //      -- need to exist in `foo.bar` yet
    //
    //      foo.bar.baz = 0
    //
    //   B. This is a non `??` compound assignment, where which every key must
    //      exist so we can get the current value
    //
    //      foo.bar.baz += 1
    //
    //      Note that the final key not need exist when the compound operator
    //      is `??`:
    //
    //      -- The key `bar` must already exist in `foo`, but `baz` does not
    //      -- need to exist in `foo.bar` yet
    //
    //      foo.bar.baz ??= 0

    if (newKeys.length || (isCompound && rhs.value.op !== "??")) {
      checkKey(object, key);
    }

    // Child will be undefined for the final key when assignment is not compound
    // and the key doesn't already exist, but it's ok in that case since there's
    // no prev node to access it. Child will get default value `null` (none) for
    // the compound operator `??=` if the key is not yet defined, and will be
    // replaced by the default value in the `??` expression in `rhs`

    const child = object.get(key, null);
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
  //   items = Obj.set(items, i, List.set(items[i], "quantity", prev + 1))

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
    const args = await this.evalEach(argNodes);
    const func = await this.eval(funcNode, "function");
    const elems = [];

    for (const elem of iter) {
      // setBlame improves error location reporting
      //
      // >> ["a"] $ Math.abs $ print
      // panic: type error
      // expected: number
      // got: string
      //
      // ["a"] $ Math.abs $ print
      //             ^
      // At repl:1:13
      //
      // vs
      //
      // >> ["a"] $ Math.abs $ print
      // panic: type error
      // expected: number
      // got: string
      //
      // ["a"] $ Math.abs $ print
      //                  ^
      // At repl:1:18

      this.setBlame(funcNode.loc);
      elems.push(await func.call(elem, ...args));
    }

    return im.List(elems);
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
      return await iter.filter(func, args);
    }

    const elems = [];

    for (const elem of iter) {
      this.setBlame(funcNode.loc);
      if (await func.callCondition(elem, ...args)) {
        elems.push(elem);
      }
    }

    return im.List(elems);
  }

  evalFn(node) {
    const { name, params, body } = node.value;

    // Anon functions have nam "fn"
    const parent = name === "fn" ? this.snapshot() : this;

    const handler = async (...args) => {
      const defs = new Map(params.map((param, index) => [param, args[index]]));
      const env = parent.spawn(defs);

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
    const { branches, fallback } = node.value;

    for (const { cond, body } of branches) {
      if (await this.eval(cond, "boolean")) {
        return await this.eval(body);
      }
    }

    return fallback ? await this.eval(fallback) : null;
  }

  async evalMatch(node) {
    const { cond: condNode, cases, fallback } = node.value;
    const cond = await this.eval(condNode);

    for (const { patterns, body } of cases) {
      for (const patternNode of patterns) {
        const pattern = await this.eval(patternNode);

        if (im.is(pattern, cond)) {
          return await this.eval(body);
        }
      }
    }

    return fallback ? await this.eval(fallback) : null;
  }

  async runCheckBreak(body) {
    try {
      await this.eval(body);
    } catch (err) {
      if (err instanceof Breaker) {
        return true;
      }

      if (err instanceof Continuer) {
        return false;
      }

      throw err;
    }

    return false;
  }

  async evalFor(node) {
    // for loops suffer from same issue as in JS where loop variable gets
    // which has potential to give weird behavior with closures, but ptls
    // anon functions will (eventually) capture snapshot of env not full
    // closure which will make the issue irrelevant

    const { name, range: rangeNode, body } = node.value;
    const range = await this.eval(rangeNode, "list", "table", "object", "set");
    const values = getType(range) === "object" ? range.keys() : range;

    for (const value of values) {
      this.setDef(name, value);

      if (await this.runCheckBreak(body)) {
        break;
      }
    }

    return null;
  }

  async evalTandemFor(node) {
    const { keyName, valName, range: rangeNode, body } = node.value;
    const range = await this.eval(rangeNode, "list", "object", "table");
    const entries = getType(range) === "object" ? range : range.entries();

    for (const [key, value] of entries) {
      this.setDef(keyName, key);
      this.setDef(valName, value);

      if (await this.runCheckBreak(body)) {
        break;
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
      if (await this.runCheckBreak(body)) {
        break;
      }
    }

    return null;
  }

  async evalWhile(node) {
    const { cond, body } = node.value;

    while (await this.eval(cond, "boolean")) {
      if (await this.runCheckBreak(body)) {
        break;
      }
    }

    return null;
  }

  async evalObject(node) {
    const map = new Map();

    for (const { key: keyNode, value: valueNode } of node.value) {
      const key = await this.eval(keyNode);
      map.set(key, await this.eval(valueNode));
    }

    return im.OrderedMap(map);
  }

  async evalTable(node) {
    const { headers, rows } = node.value;
    const columns = [];

    for (const header of headers) {
      const name = await this.eval(header, "string");
      columns.push({ name, values: [] });
    }

    for (const row of rows) {
      for (const [index, cell] of row.entries()) {
        columns[index].values.push(await this.eval(cell));
      }
    }

    const entries = columns.map(({ name, values }) => [name, im.List(values)]);
    return new Table(im.OrderedMap(entries));
  }

  async evalAccess(node) {
    const { lhs: lhsNode, rhs: rhsNode } = node.value;
    const lhs = await this.eval(lhsNode, "list", "object", "table");
    const rhs = await this.eval(rhsNode);

    this.setBlame(rhsNode.loc);

    switch (getType(lhs)) {
      case "list":
        checkIndex(lhs, rhs);
        return lhs.get(rhs);

      case "object":
        checkKey(lhs, rhs);
        return lhs.get(rhs);

      case "table":
        return lhs.get(rhs);
    }
  }
}
