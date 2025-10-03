function escapeHtml(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function serialize(value, raw) {
  const flattened = typeof value?.[Symbol.iterator] === "function"
    ? [...value]
    : [value];

  return raw
    ? flattened.map((val) => (val ? val : "")).join("")
    : escapeHtml(flattened.map(String).join(""));
}

export function h(strings, ...values) {
  let result = "";

  for (const [index, value] of values.entries()) {
    const str = strings[index];

    result += str.endsWith("$")
      ? str.slice(0, -1) + serialize(value, true)
      : str + serialize(value, false);
  }

  return result + strings.at(-1);
}
