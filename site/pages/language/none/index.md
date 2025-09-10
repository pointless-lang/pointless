---
title: "Language Reference: None"
summary: None values
---

## Syntax

## Uses

`none` is useful for representing values that are not defined or which cannot be
calculated.

```ptls --no-echo
-- Define `state` as `none` for a city that has no state
{ city: "Washington", state: none, population: 702250 }
```

```ptls --no-echo
-- Get the first item in `list`, or `none` if list is empty
fn first(list)
  if isEmpty(list) then
    none
  else
    list[0]
  end
end
```
