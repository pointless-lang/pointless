---
title: "The Standard Library: Overloads"
type: module
subtitle: Global wrapper functions combining similar type-specific functions
---

Some modules contain functions with the same name as those in other modules. For
example, `List`, `Str`, and `Table` each contain a `reverse` function. Normally
this wouldn't be a problem, but it gets tricky when we want to make those
functions global; without a module prefix, how does the language know which
version of the function to call?

To solve this, the standard library provides overloaded functions: global
wrapper functions combining two or more module functions with the same name. The
overloaded function will choose which module function to call based on the type
of the first argument it receives. For example, the function
`Overloads.reverse(values)` will call `List.reverse(list)`,
`Str.reverse(string)`, or `Table.reverse(table)` based on the type of `values`

```ptls
reverse("hello") -- Calls Str.reverse
reverse([1, 2, 3, 4, 5]) -- Calls List.reverse
```
