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

  for (let [index, value] of values.entries()) {
    const str = strings[index];

    const flattened =
      typeof value?.[Symbol.iterator] === "function" ? [...value] : [value];

    if (str.endsWith("$$")) {
      const val = flattened.map((val) => (val ? val : "")).join("");
      result += str.slice(0, -2) + val;
    } else {
      const val = flattened.map(String).join("");
      result += str + escapeHtml(val);
    }
  }

  return result + strings.at(-1);
}
