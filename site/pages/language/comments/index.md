---
title: "Language Reference: Comments"
subtitle: Comment syntax, comments as documentation, and commenting out code
---

## Comment Syntax

Comments in Pointless start with two dashes `--` an continue until the end of
the line.

```ptls
-- This is a comment!
```

Comments can be placed at the end of a line containing code

```ptls --no-eval
avg = (a + b) / 2 -- Calculate the average of `a` and `b`
```

or on their own line.

```ptls --no-eval
-- Calculate the hamonic mean of `a` and `b`
avg = 2 / (1 / a + 1 / b)
```

## Comments as Documentation

Comments can be used to describe what a piece of code does and how it works. The
example below uses comments to describe the behavior of the function `factors`,
mark what each variable does, and explain the algorithm being implemented.

```ptls
-- Calculate the prime factors of a positive integer `num`. Return a list of
-- the calculated factors. Requires that `num > 1`.

fn factors(num)
  div = 2 -- Current factor being tested
  result = [] -- The list of factors found

  -- Calculate factors using trial division:
  --
  -- Check if `div` is a factor of `num`. If it is, then add `div` to the list
  -- of found factors and divide `num` by the current factor. If not then move
  -- on to the next possible factor. Continue until `num == 1`.

  while num > 1 do
    if num % div == 0 then
      result |= push(div)
      num /= div
    else
      div += 1
    end
  end

  result
end

-- Calculate the prime factors of `60`
factors(60)
```

## Commenting Out Code

Comment syntax can also be used to temporarily disable lines of code, which
comes in handy during development. In the example below, we disable the line of
code that gets input from the user in order to test the rest of the program
using a hard-coded value.

```ptls
-- name = prompt("Enter a name: ")
name = "豆豆"
"Hello $name!"
```
