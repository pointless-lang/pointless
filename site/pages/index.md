---
title: The Pointless Language
---

```ptls
alphabet = chars("abcdefghijklmnopqrstuvwxyz")

fn shift(letter)
  index = List.indexOf(alphabet, letter)

  if index == none then
    letter
  else
    alphabet[(index + 13) % 26]
  end
end

fn cipher(message)
  message
    | chars
    $ shift
    | join("")
end

cipher("uryyb jbeyq!")
```
