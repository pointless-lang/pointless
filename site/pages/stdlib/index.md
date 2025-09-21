---
title: The Standard Library
type: collection
subtitle: Modules containing built-in functionality
---

The Pointless standard library contains useful built-in functions and constants.
This functionality is split into _modules_: globally defined objects with
definitions based around a common theme. For instance, the `Str` module contains
functions for working with string values.

You can access a module's definitions the `.` operator. For example, you would
access the `toLower` function from the `Str` module using `Str.toLower`. Some
commonly used standard library functions like `Str.chars` are available as
globals, and can be called without specifying a module name.

```ptls
Str.toLower("Pointless") -- Call the `toLower` function from the `Str` module
chars("Pointless") -- Call the global `char` function from the `Str` module
```

See the language reference for [tips on reading](/language#reading-example-code)
code examples.

Along with the [language reference](/language), the standard library
documentation is an essential resource for understaning and using the Pointless
language. Use the links below to view documentation for each module.
