---
title: "Language Reference: None"
subtitle: The none value and its uses
---

Pointless includes a value `none` which is used to represent values that aren't
defined or which can't be calculated.

See the standard library [None module](/stdlib/None) for built-in functions for
working with `none` values.

## Syntax

In Pointless, the `none` value is accessible through the `none` keyword.

```ptls
none
```

## As a Placeholder Value

Using `none` to represent a value that is not defined:

```ptls
-- Define `state` as `none` for a city that has no state
{ city: "Washington", state: none, population: 702250 }
```

Using `none` to represent a value that cannot be calculated:

```ptls
-- Get the first item in `list`, or `none` if list is empty
fn first(list)
  if isEmpty(list) then
    none
  else
    list[0]
  end
end

first(["a", "b", "c", "d"])
first([])
```
