---
title: "Language Reference: Loops"
subtitle: For and while loops, running code iteratively (multiple times)
---

Loops allow programs to run code _iteratively_ (multiple times). Pointless has
two traditional looping constructs: `for` loops and `while` loops.

## For Loops

The basic form of a `for` loop has the syntax

```ptls --no-eval
for variable in sequence do
  ...block
end
```

in which

- `variable` is a valid [variable name](../variables#defining-variables)
- `sequence` is an expression that evaluates to a list, table, object, or set
- `...block` is a [code block](misc#code-blocks) that is evaluated once for each
  value in `sequence`

A `for` loop iterates over the values in a data-structure `sequence`. Those
values will be:

- List elements, if `sequence` is a list
- Table rows, if `sequence` is a table
- Object keys, if `sequence` is a object
- Set items, if `sequence` is a set

For each value in `sequence`, the `for` loop will store the value in `variable`
and evaluate the code in `...block`. In the example below, the code `total += n`
runs `5` times, once for each value in `numbers`, with `n` taking on the value
of each number in `numbers` in order.

```ptls
numbers = [1, 2, 3, 4, 5]
total = 0

for n in numbers do
  total += n
end

total
```

`for` loops are [statements](../misc#statements), meaning they don't produce
values directly. Instead, they are used to run code containing
[side effects](../misc#side-effects) (like updating a variable).

Note that the [map](../pipelines#map) `$` and [filter](../pipelines#filter) `?`
operators are often used instead of `for` loops.

## Tandem For Loops

- list

  ```ptls --no-eval
  for index, elem in list do
    ...block
  end
  ```

- table

  ```ptls --no-eval
  for index, row in table do
    ...block
  end
  ```

- object

  ```ptls --no-eval
  for key, value in object do
    ...block
  end
  ```

```ptls
states = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola"]

for index, state in states do
  print("$index $state")
end
```

## Anonymous For Loops

```ptls
fibonacci = [0, 1]

-- Add the next 5 Fibonacci numbers to the list
for 10 do
  fibonacci |= push(fibonacci[-1] + fibonacci[-2])
end

fibonacci
```

## While Loops

```ptls
n = 7
seq = [n]

while n > 1 do
  n = if Math.isEven(n) then n / 2 else n * 3 + 1 end
  seq |= push(n)
end

seq
```
