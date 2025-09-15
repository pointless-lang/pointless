---
title: "Language Reference: Strings"
subtitle: Strings (pieces of text), string interpolation, and string operators
---

Strings are pieces of text, represented as a sequence of characters. Pointless
does not include a separate type for working with individual characters. When
necessary, characters are simply represented as strings with length one. For
example, the `chars` function, which splits a string into characters, returns a
list of single-character strings.

Important string-related functions include:

| Function                       | Use                                            |
| ------------------------------ | ---------------------------------------------- |
| [chars](/stdlib/Str#chars)     | Get a list of the characters in a string       |
| [isEmpty](/stdlib/Str#isEmpty) | Check if a string is empty                     |
| [join](/stdlib/Str#join)       | Join a list of strings together                |
| [len](/stdlib/Str#len)         | Get the length of a string                     |
| [lines](/stdlib/Str#lines)     | Get a list of the lines in a string            |
| [parse](/stdlib/Str#parse)     | Convert a string to another primitive type     |
| [replace](/stdlib/Str#replace) | Replace occurrences of a substring in a string |
| [split](/stdlib/Str#split)     | Split a string into a list of strings          |

See the standard library [Str module](/stdlib/Str) for more built-in functions
for working with strings.

## Syntax

Strings are created by placing text between double quotes `"`.

```ptls
"Hello world 👋🏽🌎!"
```

## Multi-line Strings

Strings are allowed to span multiple lines.

```ptls
print("
To the same place, the same face, the same brute
Amused shout:

A miracle!
That knocks me out.
")
```

If the first line of a multi-line string (the one containing the opening quote)
is empty or contains only whitespace, it will be omitted from the resulting
string. The same rule applies to the last line (the one containing the closing
quote). For example, the following two multi-line strings are equivalent.

```ptls --no-echo
"
Hello
world
"

"Hello
world"
```

## Multi-line String Alignment

The Pointless parser normalizes the indentation of multi-line strings by
removing any indentation shared by every line in the string. This means that you
can indent expressions containing multi-line strings in Pointless without
changing the value of the strings, making it easier to format code that uses
multi-line strings. This is similar to how
[text blocks](https://openjdk.org/jeps/378) behave in Java, and avoids the need
for functions like Python's
[textwrap.dedent](https://docs.python.org/3/library/textwrap.html#textwrap.dedent).

You can control this normalization process by adjusting the indentation of the
line containing the closing quote, as illustrated below.

```ptls
print("
    Hello
      World
")

print("
    Hello
      World
  ")

print("
    Hello
      World
    ")
```

## Interpolation

String interpolation lets you insert variable values into strings. When a string
contains a dollar sign `$` followed by a variable name, the language will load
the value of that variable into the string in its place.

```ptls
container = "box"
item = "chocolate"
"a $container of $item"
```

If the variable holds a non-string value, its string representation will be
inserted into the interpolated string.

```ptls
bottles = 99
"$bottles bottles of beer"
```

You can wrap the name of an interpolated variable in parentheses to separate it
from adjoining characters that would otherwise be misinterpreted as part of the
variable name.

```ptls
dist = 5
"Distance: $(dist)km" -- Without parens the variable name would be parsed as `distkm`
```

## Field Interpolation

When using string interpolation with object values, variables may specify a
field to read the interpolated value from.

```ptls
point = { x: 3, y: 4 }
"($point.x, $point.y)"
```

## Interpolation in Pipelines

Strings in Pointless can only interpolate values based on variable and field
names, rather than
[arbitrary embedded expressions](/articles/str-interp-syntax). However, strings
_can_ interpolate the [pipeline placeholder](../pipelines#placeholder-arg)
variable `arg`, which lets them receive the result of another expression
directly as part of a function pipeline.

```ptls --input "avery"
rect = { width: 3, height: 4 }

rect
  | arg.width * arg.height
  | "Area: $arg"
```

## Character Escapes

Strings can include the following character escape sequences:

- `\n` Newline
- `\r` Return
- `\t` Tab
- `\\` Backslash
- `\"` Double quote

```ptls
print("\\Hello\n\"world\"!")
```

## Unicode Escapes

Unicode escape sequences have the form `\u{...}`, where `...` is a sequence of
between 1 and 6 hexadecimal digits specifying the code point of the desired
character. Code points must have a value between `0` and `10FFFF`.

```ptls
"\u{2705} Correct! \u{1F4AF}"
```

## Raw Strings

Raw strings in Pointless are prefixed with the character `r`. Unlike regular
strings, raw strings do not interpret escape sequences or perform string
interpolation, which makes them useful for storing pieces of text verbatim.

```ptls
r"Hello\t$world\n"
```

To store quotes `"` in raw strings, wrap the outer string quotes with hash `#`
characters.

```ptls
r#"Hello "world""#
```

To store a string containing a quote `"` preceded by one or more hash `#`
characters, simply increase the number of hash characters enclosing the raw
string. This flexibility allows raw string literals to contain any sequence of
characters.

```ptls
r##"The #"Pointless"# language"##
```

The lack of escape sequence parsing in raw strings makes them ideal for writing
regular expressions.

```ptls
emailAddr = r"^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$"
Re.test("info@ptls.dev", emailAddr)
```

Like regular strings, raw strings can span multiple lines. Multi-line raw
strings are subject to the same
[alignment process](#multi-line-string-alignment) as regular strings.

```ptls
logo = r#"
  <a id="logo" href="/">
    <img src="/icons/icon.svg" />
    Pointless
  </a>
  "#

print(logo)
```

## Comparison

Strings can be compared for equality using the equals `==` and not-equals `!=`
operators.

```ptls
"peach" == "peach"
"peach" != "pear"
"abc" == "\u{61}\u{62}\u{63}"
```

Strings can also be compared lexicographically using the following inequality
operators:

- `<` less-than
- `>` greater-than
- `<=` less-than-or-equal-to
- `>=` greater-than-or-equal-to

```ptls
"peach" < "pear"
"peach" >= "pear"
"peach" >= "peach"
```

## Concatenation

Strings can be concatenated using the plus `+` operator.

```ptls
"point" + "less"
```

## Repetition

Strings can be repeated with using the star `*` operator along with an integer
repetition count.

```ptls
"la" * 5
```
