import { checkType, getType } from "../lang/values.js";
import { Panic } from "../lang/panic.js";
import im from "../immutable/immutable.js";
import { argv } from "node:process";

function parseParam(config) {
  checkType(config, "object");

  if (!config.has("name")) {
    throw new Panic("option missing name field", { option: config });
  }

  const name = config.get("name");
  checkType(name, "string");

  if (name.startsWith("--")) {
    if (!config.has("default")) {
      throw new Panic("named param requires a default value", { name });
    }

    const key = name.slice(2);
    const $default = config.get("default");
    checkType($default, "number", "boolean", "string");
    return { key, named: true, type: getType($default), default: $default };
  }

  if (name.startsWith("...")) {
    return { key: name.slice(3), named: false, spread: true };
  }

  return { key: name, named: false };
}

function parseValue(raw, param) {
  switch (param.type) {
    case "number": {
      const n = Number(raw);

      if (raw === "" || Number.isNaN(n)) {
        throw new Panic("invalid value for numeric param", {
          name: `--${param.key}`,
          value: raw,
        });
      }

      return n;
    }

    case "boolean":
      if (raw === "true") {
        return true;
      }

      if (raw === "false") {
        return false;
      }

      throw new Panic("invalid value for boolean param", {
        name: `--${param.key}`,
        value: raw,
      });

    case "string":
      return raw;
  }
}

export function load(config) {
  checkType(config, "list");

  const params = [...config].map(parseParam);
  const positional = params.filter((p) => !p.named);
  const named = new Map(params.filter((p) => p.named).map((p) => [p.key, p]));
  const result = new Map();

  const spreadParam = positional.find((p) => p.spread);

  if (spreadParam && positional.at(-1) !== spreadParam) {
    throw new Panic("spread param must be last positional param", {
      name: `...${spreadParam.key}`,
    });
  }

  // Initialize named params with defaults
  for (const param of named.values()) {
    result.set(param.key, param.default);
  }

  const spreadValues = [];
  let posIndex = 0;

  for (const arg of argv.slice(3)) {
    if (arg.startsWith("--")) {
      // --no-flag for boolean negation
      if (arg.startsWith("--no-")) {
        const key = arg.slice(5);
        const param = named.get(key);

        if (!param) {
          throw new Panic("unrecognized param", { name: arg });
        }

        if (param.type !== "boolean") {
          throw new Panic("--no- prefix only valid for boolean params", {
            name: arg,
          });
        }

        result.set(key, false);
      } else if (arg.includes("=")) {
        const eqIndex = arg.indexOf("=");
        const key = arg.slice(2, eqIndex);
        const param = named.get(key);

        if (!param) {
          throw new Panic("unrecognized param", { name: `--${key}` });
        }

        result.set(key, parseValue(arg.slice(eqIndex + 1), param));
      } else {
        const key = arg.slice(2);
        const param = named.get(key);

        if (!param) {
          throw new Panic("unrecognized param", { name: arg });
        }

        if (param.type === "boolean") {
          result.set(key, true);
        } else {
          throw new Panic("missing value for param", { name: arg });
        }
      }
    } else if (posIndex < positional.length && positional[posIndex].spread) {
      spreadValues.push(arg);
    } else {
      if (posIndex >= positional.length) {
        throw new Panic("unexpected positional argument", { value: arg });
      }

      result.set(positional[posIndex].key, arg);
      posIndex++;
    }
  }

  if (spreadParam) {
    result.set(spreadParam.key, im.List(spreadValues));
  }

  if (posIndex < positional.length && !positional[posIndex].spread) {
    throw new Panic("missing positional argument", {
      name: positional[posIndex].key,
    });
  }

  return im.OrderedMap(result);
}
