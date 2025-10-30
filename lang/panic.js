import { repr } from "./repr.js";

export class Panic extends Error {
  constructor(message, details = {}, loc = undefined) {
    super(message);
    this.details = { $panic: this.message, ...details };
    // top level scope is global (anonymous) context
    this.trace = [{ loc }];
  }

  setLoc(loc) {
    this.trace.at(-1).loc ??= loc;
    return this;
  }

  pushContext(context) {
    this.trace.at(-1).context = context;
    this.trace.push({});
    return this;
  }

  showTrace() {
    let result = "";
    let lastLoc;

    for (const { context, loc } of this.trace) {
      // loc is undefined for unreadable top-level source file error
      // don't show a second trace for the same line
      // (would happen otherwise for inline function expressions)
      if (loc && !lastLoc?.sameLine(loc)) {
        // use line number to get source line
        result += `\n\n${loc.show(context)}`;
        lastLoc = loc;
      }
    }

    return result;
  }

  async repr(options = {}) {
    const entryStrs = [];

    for (const [key, value] of Object.entries(this.details)) {
      // "$" prefix means don't use `repr`
      if (key.startsWith("$")) {
        // remove "$" character
        entryStrs.push(`${key.slice(1)}: ${value}`);
      }

      entryStrs.push(`${key}: ${await repr(value, options)}`);
    }

    return entryStrs.join("\n") + this.showTrace();
  }
}
