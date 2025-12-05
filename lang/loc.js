export class Loc {
  constructor(line, column, path, getSource) {
    this.line = line;
    this.column = column;
    this.path = path;
    // Store as thunk instead of value for less cluttered logs
    this.getSource = getSource;
  }

  show(context) {
    const sourceLine = this.getSource().split("\n")[this.line - 1];
    const pointer = " ".repeat(this.column - 1) + "^";
    const pos = `${this.path}:${this.line}:${this.column}`;
    context = context ? ` in ${context}` : "";
    return `${sourceLine}\n${pointer}\nAt ${pos}${context}`;
  }

  next(...values) {
    // Get updated location after passing given token string values

    let { line, column } = this;

    for (const value of values) {
      if (value.includes("\n")) {
        const lines = value.split("\n");
        // Number of newlines
        line += lines.length - 1;
        // Column position resets after newline (1-indexed)
        column = lines.at(-1).length + 1;
      } else {
        column += value.length;
      }
    }

    return new Loc(line, column, this.path, this.getSource);
  }

  sameLine(other) {
    return this.line === other.line && this.path === other.path;
  }
}
