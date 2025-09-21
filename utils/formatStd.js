import fs from "node:fs";
import prettier from "@prettier/sync";

const comment = /(?:  \/\/.*\n)+/g;

function stripSlashes(line) {
  return line.startsWith("  // ") ? line.slice(5) : line.slice(4);
}

function addSlashes(line) {
  return line.length ? `  // ${line}` : `  //`;
}

for (const file of fs.readdirSync("std/")) {
  const source = fs.readFileSync(`std/${file}`, "utf8");

  const result = source.replace(comment, (match) => {
    if (!match.includes("```ptls")) {
      return match;
    }

    const md = match.split("\n").map(stripSlashes).join("\n");

    const formatted = prettier.format(md, {
      parser: "markdown",
      proseWrap: "always",
      printWidth: 75,
    });

    return formatted.trim().split("\n").map(addSlashes).join("\n") + "\n";
  });

  fs.writeFileSync(`std/${file}`, result, "utf8");

  // Should be itempotent
  if (result !== source) {
    console.log(`Formatted doc comments in std/${file}`);
  } else {
    console.log(`Checked doc comments in std/${file}`);
  }
}
