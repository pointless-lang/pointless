
class Location {
  int lineNum, colNum;
  String path;
  String line;

  // -------------------------------------------------------------------------

  Location(this.lineNum, this.colNum, this.path, this.line);

  // -------------------------------------------------------------------------

  bool operator==(Object other) {
    if (other is Location) {
      return other.lineNum == lineNum
        && other.colNum == colNum
        && other.path == path;
    }

    return false;
  }

  // -------------------------------------------------------------------------

  int get hashCode => lineNum + 17 * colNum;

  // -------------------------------------------------------------------------

  String toString() {
    var lineColStr = "(line ${lineNum} column ${colNum})";
    var result = "\nAt $lineColStr in '${path}'\n";
    result += "$line\n${" " * (colNum - 1)}^";
    return result;
  }
}
