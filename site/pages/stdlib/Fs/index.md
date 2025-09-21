---
title: "The Standard Library: Fs"
type: module
subtitle: Read and manipulate files and directories
---

Paths are resolved relative to the current working directory.

_Tip:_ To read files from a fixed path, consider using `import`, which which
allows you to load and process file contents from a path relative to a script's
source file.

```ptls --no-eval
import "text:some-file.txt" -- Import text file as a string
import "raw:some-file.png"  -- Import file as a list of bytes
```
