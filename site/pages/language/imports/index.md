---
title: "Language Reference: Imports and Exports"
subtitle:
---

## Exports

**binary.ptls:**

```ptls --no-echo
-- Parse a binary string as a number

fn parse(string)
  result = 0

  for bit in chars(string) do
    result *= 2
    result += Bool.toNum(bit == "1")
  end

  result
end

-- Convert a positive integer to a binary string

fn of(n)
  digits = []

  while n > 0 or digits == "" do
    digits |= push(n % 2)
    n = Math.floor(n / 2)
  end

  digits
    | reverse
    | join("")
end

{ parse, of }
```

## Imports

```ptls
bin = import "binary.ptls"

bin.parse("1101")
bin.of(13)
```

## Import Specifiers

```ptls
import "text:lyrics.txt"
```

```ptls
import "lines:lyrics.txt"
```
