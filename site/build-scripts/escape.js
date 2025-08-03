function escapeHtml(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function h(strings, ...values) {
  let result = "";

  for (let i = 0; i < values.length; i++) {
    const str = strings[i];

    if (str.endsWith("$$")) {
      const val = [values[i]]
        .flat(Infinity)
        .map((val) => (val ? val : ""))
        .join("");

      result += str.slice(0, -2) + val;
    } else {
      const val = [values[i]].flat(Infinity).map(String).join("");
      result += str + escapeHtml(val);
    }
  }

  return result + strings.at(-1);
}
