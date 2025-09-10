---
title: "The Standard Library: Fs"
type: module
summary: Read and manipulate files and directories
---

Paths are resolved relative to the current working directory.

_Tip:_ To read files from a fixed path, consider using `import`, which which
allows you to load and process file contents from a path relative to a script's
source file.

```ptls --no-eval
import "text:some-file.txt"  -- Import text as a string
import "lines:some-file.txt" -- Import text as a list of lines
import "csv:some-file.csv"   -- Import CSV as a table
import "json:some-file.json" -- Import JSON as a ptls value
import "raw:some-file.png"   -- Import file as a list of bytes
```
