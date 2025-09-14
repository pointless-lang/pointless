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

## In Language Constructs

There are several situations in which language constructs will produce `none`
values, including:

- Evaluating an `if` or `match` expression with no matching branch and no `else`
  branch.

  ```ptls
  n = 7

  if n % 2 == 0 then
    "even"
  end

  match n % 2
    case 0 then "even"
  end
  ```

- Calling a function, evaluating a conditional branch, or importing a script
  which contains no code.

  ```ptls
  fn nada()
  end

  nada()

  if true then
  end
  ```

- Calling a function, evaluating a conditional branch, or importing a script
  whose final statement is a variable assignment or a loop.

  ```ptls
  fn justChecking()
    for n in span(1, 10) do
      assert(n > 0)
    end
  end

  justChecking()

  if true then
    n = 100
  end
  ```
