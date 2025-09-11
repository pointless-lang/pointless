---
title: "Language Reference: Numbers"
subtitle: Numbers and numerical operators
---

Pointless uses a single number type for integers and decimal numbers. See the
[Math](/stdlib/Math) module in the standard library for built-in mathematical
functions.

## Syntax

Numbers in Pointless use familiar mathematical syntax.

```ptls
120
3.14
-0.5
```

Pointless numbers can also use
[engineering notation](https://en.wikipedia.org/wiki/Engineering_notation).

```ptls
1e-4
6.022e23
```

## Operators

Mathematical operations use the following symbols.

```ptls
-8 -- Negation
5 + 5 -- Addition
20 - 4 -- Subtraction
6 * 7 -- Multiplication
3 / 12 -- Division
2 ** 4 -- Exponentiation
10 % 7 -- Modulus
```

These operators obey the standard
[order of operations](https://en.wikipedia.org/wiki/Order_of_operations).

```ptls
2 + 3 * (4 + 1)
```

## Modulus Behavior

The modulus operator `%` uses the
[floor mod](https://en.wikipedia.org/wiki/Modulo#Variants_of_the_definition)
variant when operating on negative values, meaning that the result of a modulus
operation will have the same sign as the divisor (the second operand).

```ptls
10 % 7
-10 % 7
10 % -7
-10 % -7
```

## Strictness

Pointless is stricter than many other languges when it comes to numerical
operations. Calculations that would produce `NaN` or infinity value in other
languages will cause errors in Pointless.

```ptls --panics
-- Cannot take square root of a negative number
(-1) ** 0.5
```

```ptls --panics
-- Numerical overflow
10 ** 1000
```

Note that `NaN` and infinity values can be accessed via `Math.nan` and
`Math.inf`.
