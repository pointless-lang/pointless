---
title: "Language Reference: Numbers"
subtitle: Numbers and numerical operators
---

Pointless uses a single number type for integers and decimal numbers, which it
stores using
[floating-point](https://en.wikipedia.org/wiki/Floating-point_arithmetic)
representation.

Important numerical functions include:

| Function                             | Use                                 |
| ------------------------------------ | ----------------------------------- |
| [Math.abs](/stdlib/Math#abs)         | Get the absolute value of a number  |
| [Math.ceil](/stdlib/Math#ceil)       | Round a number up                   |
| [Math.floor](/stdlib/Math#floor)     | Round a number down                 |
| [Math.max](/stdlib/Math#max)         | Get the maximum of two numbers      |
| [Math.min](/stdlib/Math#min)         | Get the minimum of two numbers      |
| [Math.round](/stdlib/Math#round)     | Round a number                      |
| [Math.roundTo](/stdlib/Math#roundTo) | Round a number to a given precision |
| [Math.sqrt](/stdlib/Math#sqrt)       | Get the square root of a number     |

See the standard library [Math module](/stdlib/Math) for more built-in functions
for working with numbers.

## Syntax

Numbers use familiar mathematical syntax.

```ptls
120
3.14
-0.5
```

Numbers can also use
[engineering notation](https://en.wikipedia.org/wiki/Engineering_notation).

```ptls
1e-4
6.022e23
```

## Operators

Mathematical operations use the following operators.

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

## Comparison

Numbers can be compared for equality using the equals `==` and not-equals `!=`
operators.

```ptls
1 + 1 == 2
2 + 2 != 4
```

Numbers can also be compared using the inequality operators:

- `<` less-than
- `>` greater-than
- `<=` less-than-or-equal-to
- `>=` greater-than-or-equal-to

```ptls
1 < 2
1 > 2
5 > 5
5 >= 5
```

## Floating-point Error

Like any system based on floating-point arithmetic, the results of some
numerical operations in Pointless involving non-integer values
[will be inexact](https://en.wikipedia.org/wiki/Floating-point_arithmetic#Accuracy_problems).
Watch out for this behavior when comparing non-integer values.

```ptls
n = (Math.sqrt(5) * 2) ** 2
n

n == 20
```

## Strictness

Pointless is stricter than many other languges when it comes to numerical
operations. Calculations that would produce a
[NaN](https://en.wikipedia.org/wiki/IEEE_754#NaNs) or
[infinity](https://en.wikipedia.org/wiki/IEEE_754#Infinities) value in other
languages will cause errors in Pointless.

```ptls --panics
-- Cannot take square root of a negative number
(-1) ** 0.5
```

```ptls --panics
-- Numerical overflow
10 ** 1000
```

Note that NaN and infinity values can be accessed via `Math.nan` and `Math.inf`.
