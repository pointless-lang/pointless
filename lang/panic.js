import { repr } from "./repr.js";

export class Panic extends Error {
  constructor(message, details = {}, loc = undefined) {
    super(message);
    this.details = { $panic: this.message, ...details };
    // Top level scope is global (anonymous) context
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
      // Loc may be undefined.
      // Most errors that aren't created with a loc will get one later, but
      // some like unreadable top-level source file error won't

      // Don't show a second trace for the same line, which
      // would happen otherwise for inline function expressions

      if (loc && !lastLoc?.sameLine(loc)) {
        // Use line number to get source line
        result += `\n\n${loc.show(context)}`;
        lastLoc = loc;
      }
    }

    return result;
  }

  toString() {
    const entryStrs = [];

    for (const [key, value] of Object.entries(this.details)) {
      // "$" prefix means don't use `repr`
      if (key.startsWith("$")) {
        // Remove "$" character
        entryStrs.push(`${key.slice(1)}: ${value}`);
      } else {
        entryStrs.push(`${key}: ${repr(value, "compact")}`);
      }
    }

    return entryStrs.join("\n") + this.showTrace();
  }
}
