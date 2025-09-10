---
title: The Standard Library
type: collection
summary: Modules containing built-in functionality
---

The Pointless standard library contains useful built-in functions and constants.
This functionality is split into _modules_: globally-defined objects with
definitions based around common themes. For instance, the `Str` module contains
functions for working with string values.

Since standard library modules are objects, you can access their defitions using
the `.` operator. For example, you would access the `toLower` function from the
`Str` module using `Str.toLower`. Some commonly used standard library functions
like `Str.chars` are available as globals, and can be called without using a
module prefix.

```ptls
Str.toLower("Pointless")
chars("Pointless")
```

The standard library docs use symbols to highlight the following special
properties:

- <span class="tag" title="Global"></span> Functions available as globals
- <span class="tag" title="Overloaded"></span> Functions available as globals
  through [overloads](Overloads)
- <span class="tag" title="Constant"></span> Constants (non-function
  definitions)

The [language reference](/language) includes tips for reading the code examples
in these documents.

Along with the language reference, the standard library documentation is an
essential resource for understaning and using the Pointless language. Use the
links below to view documentation for each module.
