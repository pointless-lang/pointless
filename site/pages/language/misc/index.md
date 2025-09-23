---
title: "Language Reference: Miscellaneous"
subtitle:
---

- statements expressions
- newline statements
- semicolons
- identifiers
- statement blocks
- whitespace
- name syntax
- comments
- camel case
- no newline index field call
- primitives

- precedence
- operators
- pow parens
- parens
- associativity

side effects (like printing a value, setting a variable, or returning from a
function)

## In Language Constructs

There are several situations in which language constructs will produce `none`
values, including:

- Evaluating an `if` or `match` expression with no matching branch and no `else`
  branch.
- Calling a function, evaluating a conditional branch, or importing a script
  which contains no code, or whose [final statement](misc#final-statement-value)
  is not an expression.

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

## Identifier Names

An identifier in Pointless is a name that starts with an ASCII letter `[a-zA-Z]`
and is followed by zero or more ASCII letters or digits `[a-zA-Z0-9]`. Variable
names must be valid identifiers, and must not be [keywords].

**Valid identifier examples:**

```
nickname
highScore
player2
```

**Invalid identifier examples:**

```
nick$nam€
high_score
2player
```
