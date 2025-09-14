---
title: "The Standard Library: Re"
type: module
subtitle: Use regular expressions to search and manipulate strings
---

As Pointless is currently implemented in JavaScript, it inherits some of the
[limitations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters)
of the UTF-16 encoding that JS uses, for example:

```ptls
Re.test("☺", "^.$") -- '.' matches BMP character U+263A
Re.test("😀", "^.$") -- '.' doesn't match SMP character U+1F600
```
