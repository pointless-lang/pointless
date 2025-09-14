---
title: "Language Reference: Booleans"
subtitle: Boolean (true and false) values and logical operators
---

Pointless includes boolean (`true` and `false`) values, which let us write code
that performs logical calculations.

See the standard library [Bool module](/stdlib/Bool) for built-in functions for
working with boolean values.

## Syntax

In Pointless, booleans are accessible through keywords.

```ptls --no-echo
true
false
```

## Operators

Pointless provides the following operators for constructing logical expressions.

```ptls
true and false -- Logical "and", true when both operands are true
true or false -- Logical "or", true when either operand is true
not true -- Logical "not", true when operand is false
```

## Short Circuiting

Note that the `and` and `or` operators are
[short circuiting](https://en.wikipedia.org/wiki/Short-circuit_evaluation),
meaning that they only evaluate their second (right-hand) operand if the result
of the expression cannot be determined by the initial (left-hand) operand.

```ptls
fn isPositive(n)
  print("ran isPositive")
  n >= 0
end

fn isWhole(n)
  print("ran isWhole")
  n % 1 == 0
end

-- First operand is false so the second won't be evaluated
isPositive(-1) and isWhole(-1)
```

```ptls
-- First operand is true so both operands are evaluated
isPositive(1.5) and isWhole(1.5)
```
