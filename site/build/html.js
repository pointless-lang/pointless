function escape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function html(strings, ...values) {
  let result = "";

  for (let i = 0; i < values.length; i++) {
    const str = strings[i];
    
    if (str.endsWith("$$")) {
      result += str.slice(0, -2) + values[i];
    } else {
      result += str + escape(values[i]);
    }
  }

  return result + strings.at(-1);
}
