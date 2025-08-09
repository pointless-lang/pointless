---
title: Pointless Programming Language
---

Let's see an example to get a feel for the language. I'll show you how I wrote
the following program, which can encode and decode a message using a simple
cipher.

```ptls --no-eval
alphabet = chars("abcdefghijklmnopqrstuvwxyz")

-- Shift a single letter 13 places

fn shift(letter)
  index = list.indexOf(alphabet, str.toLower(letter))

  if index == none then
    letter
  else
    shifted = alphabet[(index + 13) % 26]

    if str.isUpper(letter) then
      str.toUpper(shifted)
    else
      shifted
    end
  end
end

-- Encode or decode a message with the ROT13 cipher
-- https://en.wikipedia.org/wiki/ROT13

fn cipher(message)
  message
    | chars
    $ shift
    | join("")
end

-- What does this print?

"Uryyb jbeyq!"
  | cipher
  | print
```
