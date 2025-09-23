---
title: "Language Reference: Conditionals"
subtitle: If and match expressions, running code based on one or more conditions
---

Conditionals allow programs to run code conditionally; that is, based on one or
more conditions. Pointless has two conditional constructs: `if` expressions and
`match` expressions.

## If Expressions

The basic form of an `if` expression has the syntax

```ptls --no-eval
if condition then
  ...thenBlock
else
  ...elseBlock
end
```

in which

- `conition` is an expression that evaluates to a boolean
- `...thenBlock` is a [code block](misc#code-blocks) that is evaluated if
  `condition` is `true`
- `...elseBlock` is a [code block](misc#code-blocks) that is evaluated if
  `condition` is `false`
- The `if` and `else` parts of the expression are known as _branches_

The value of the `if` expression is equal to the value of whichever branch's
code block is evaluated. In the example below, `sign` is set to `positive` since
`n >= 0` is `true`.

```ptls
n = 0

sign = if n >= 0 then "positive" else "negative" end
```

## Elif Branches

`if` expressions may contain one or more `elif` branches, each with a condition
and a code block that is evaluated the condition is true. The conditions of the
`if` and `elif` branches are tested in order; as soon as an `if` or `elif`
condition evaluates to true, that branch's code block is evaluated and its value
becomes the value of the `if` expression. No later branches are tested or
evaluated.

```ptls
n = 0

sign = if n > 0 then
  "positive"
elif n < 0 then
  "negative"
else
  "zero"
end
```

## If Without Else

`if` expressions don't need to have `else` branches. If none of the `if` or
`elif` branches in an `if` expression have conditions that are `true`, and the
expression has no `else` branch, then the expression evaluates to `none`.

```ptls
health = 2

if health == 0 then
  print("game over")
end
```

## If as a Statement

An `if` expression may also be used as a [statement](misc#statements), in which
case its value is ignored. In these cases, the expression is used to run
[side effects](../misc#side-effects) (like printing a value or updating a
variable) while the result of the expression itself is not used.

```ptls
rect = { width: 3, height: 4 }
scale = 2

if scale == 1 then
  print("no scaling need")
else
  rect.width *= scale
  rect.height *= scale
end

rect
```

The `none` in the output above is the unused result from the `if` expression.

## Match Expressions

The basic form of a `match` expression has the syntax

```ptls --no-eval
match expression
  case option then
    ...block

  case option then
    ...block

  ...

  case option then
    ...block

  else ...elseBlock
end
```

in which

- `expression` and each `optionN` are expressions
- each `...block` is a [code block](misc#code-blocks) that is evaluated if the
  corresponding `option` [matches](../objects#object-matching) `expression`
- `...elseBlock` is a [code block](misc#code-blocks) that is evaluated if none
  of the options matched expression
- The `case` and `else` parts of the expression are each known as _branches_
- The `match` expression contains any number of `case` branches

The value of the `match` expression is equal to the value of whichever branch's
code block is evaluated. The option expressions of the `case` branches are
tested in order; as soon as an option is found that
[matches](../objects#object-matching) the value of `expression` , that branch's
code block is evaluated and its value becomes the value of the `match`
expression. No later branches are tested or evaluated.

In the example below, `parity` is set to `odd` since `n % 2` is `1`.

```ptls
n = 5

parity = match n % 2
  case 0 then "even"
  case 1 then "odd"
  else        "non integer"
end
```

## Match without Else

`match` expressions don't need to have `else` branches. If none of the `case`
branches in a `match` expression have options that match the value of
`expression`, and the `match` expression has no `else` branch, then the
expression evaluates to `none`.

```ptls
n = 1.5

parity = match n % 2
  case 0 then "even"
  case 1 then "odd"
end
```

## Multi-Option Cases

`case` branches can have multiple option expressions, separated by commas `,`.
If any one of a branches options matches the value of `expression`, then the
branch is evaluated.

```ptls
shape = { type: "rectangle", width: 3, height: 4 }

width = match shape.type
  case "square", "rectangle" then shape.width
  case "circle"              then shape.radius * 2
end
```

## Match as a Statement

A `match` expression may also be used as a [statement](misc#statements), in
which case its value is ignored. In these cases, the expression is used to run
side effects (like printing a value, setting a variable, or returning from a
function) while the result of the expression itself is not used.

```ptls
shape = { type: "rectangle", width: 3, height: 4 }
scale = 2

match shape.type
  case "square" then
    shape.width *= 2

  case "rectangle" then
    shape.width *= 2
    shape.height *= 2

  case "circle" then
    shape.radius *= 2
end

shape
```
