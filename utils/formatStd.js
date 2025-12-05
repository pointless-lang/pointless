import fs from "node:fs";
import prettier from "@prettier/sync";

// Look for comments inside functions (one level of indentation)
const comment = /( {2}\/\/.*\n)+/g;

function stripSlashes(line) {
  // Remove indentation, slashes, and potential trailing space
  return line.replace(/ {2}\/\/ ?/, "");
}

function addSlashes(line) {
  // Add trailing space for non-empty lines
  return line.length ? `  // ${line}` : `  //`;
}

for (const file of fs.readdirSync("std/")) {
  const source = fs.readFileSync(`std/${file}`, "utf8");

  const result = source.replace(comment, (match) => {
    // Assume comment is a doc comment iff it contains a ptls md code block
    if (!match.includes("```ptls")) {
      return match;
    }

    const md = match.split("\n").map(stripSlashes).join("\n");

    const formatted = prettier.format(md, {
      parser: "markdown",
      proseWrap: "always",
      printWidth: 75, // 80 minus prefix len
    });

    return formatted.trim().split("\n").map(addSlashes).join("\n") + "\n";
  });

  fs.writeFileSync(`std/${file}`, result, "utf8");

  // Should be idempotent
  if (result !== source) {
    console.log(`Formatted doc comments in std/${file}`);
  }
}
