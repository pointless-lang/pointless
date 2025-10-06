---
title: "Language Reference: Lists"
subtitle:
---

Important list-related functions include:

| Function                          | Use                                       |
| --------------------------------- | ----------------------------------------- |
| [drop](/stdlib/List#drop)         | Remove values from the start of a list    |
| [isEmpty](/stdlib/List#isEmpty)   | Check if a list is empty                  |
| [len](/stdlib/List#len)           | Get the length of a list                  |
| [push](/stdlib/List#push)         | Add a value to the end of a list          |
| [range](/stdlib/List#range)       | Get a list of integers up to a value      |
| [reverse](/stdlib/List#reverse)   | Reverse a list                            |
| [sort](/stdlib/List#sort)         | Sort a list in ascending order            |
| [sortDesc](/stdlib/List#sortDesc) | Sort a list in descending order           |
| [span](/stdlib/List#span)         | Get a list of integers between two values |
| [take](/stdlib/List#take)         | Get values from the front of a list       |

See the standard library [List module](/stdlib/List) for more built-in functions
for working with lists.

## Lists

```ptls
states = ["CT", "MA", "ME", "NH", "RI", "VT"]
```

```ptls
states[0]
states[1]
```

```ptls
states[-1]
states[-2]
```

```ptls
states[1] = "Massocheichei"
states[-1] += "!"
```

## Map Operator

```ptls
["Jan", "Feb", "Mar", "Apr", "May", "June"] $ Str.toUpper
span(0, 10) $ 2 ** arg
```

## Filter Operator

```ptls
["Jan", "Feb", "Mar", "Apr", "May", "June"] ? Str.startsWith("J")
span(0, 10) ? Math.isOdd
```

## Concatenation

```ptls
["Jan", "Feb", "Mar"] + ["Apr", "May", "June"]
```

## Repetition

```ptls
[0] * 5
["do", "re", "mi"] * 2
```
