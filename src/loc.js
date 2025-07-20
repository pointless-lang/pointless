export class Loc {
  constructor(line, column, path, getSource) {
    this.line = line;
    this.column = column;
    this.path = path;
    // store as thunk instead of value for less cluttered logs
    this.getSource = getSource;
  }

  show(context) {
    const sourceLine = this.getSource().split("\n")[this.line - 1];
    const pointer = " ".repeat(this.column - 1) + "^";

    const pos = this.path
      ? `${this.path}:${this.line}:${this.column}`
      : `${this.line}:${this.column}`;

    context = context ? ` in ${context}` : "";
    return `${sourceLine}\n${pointer}\nAt ${pos}${context}`;
  }

  next(...values) {
    let { line, column } = this;

    for (const value of values) {
      if (value.includes("\n")) {
        const lines = value.split("\n");
        // number of newlines
        line += lines.length - 1;
        // 1 indexed
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
