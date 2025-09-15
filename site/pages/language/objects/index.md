---
title: "Language Reference: Objects"
subtitle:
---

For information on built-in functions for working with objects, see the standard
library [Object module](/stdlib/Object).

- objets
- punning
- ident keys and columns
- field names
- object merge
- update field
- set new field
- record objects

- set, object order

- object matching

`object` has all of the keys in `matcher`, and that for every `key` shared
between `object` and `matcher`:

- `object[key]` _matches_ `matcher[key]` if both values are objects
- `object[key] == matcher[key]` otherwise
