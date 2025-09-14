---
title: The Standard Library
type: collection
subtitle: Modules containing built-in functionality
---

The Pointless standard library contains useful built-in functions and constants.
This functionality is split into _modules_: globally-defined objects with
definitions based around common themes. For instance, the `Str` module contains
functions for working with string values.

You can access a module's definitions the `.` operator. For example, you would
access the `toLower` function from the `Str` module using `Str.toLower`. Some
commonly used standard library functions like `Str.chars` are available as
globals, and can be called without using a module prefix.

```ptls
Str.toLower("Pointless") -- Call the `toLower` function from the `Str` module
chars("Pointless") -- Call the global `char` function from the `Str` module
```

The language reference includes
[tips for reading](/language#reading-example-code) the code examples in these
documents.

Along with the [language reference](/language), the standard library
documentation is an essential resource for understaning and using the Pointless
language. Use the links below to view documentation for each module.
