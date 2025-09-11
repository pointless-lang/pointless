---
title: "Language Reference: Printing and User Input"
subtitle: Print values and get user input in the console
---

While in-depth coverage of built-in functions is left to the
[standard library](/stdlib) documentation, the `print` and `prompt` functions
are so commonly used that they deserve mention here as well.

## Printing

The [print](/stdlib/Console#print) function is used to display values.

```ptls
print("Hello world!")
```

We can combine [string interpolation](/stdlib/strings#interpolation) with
`print` to insert variable values into printed messages.

```ptls
name = "Theo"
print("Hello $name!")
```

We can call `print` with values of any type. If `print` is called with a
non-string value, it will display the string-representation of the value.

```ptls
print(7 / 10)
print([])
print(sum)
```

## Prompting

The [prompt](/stdlib/Console#prompt) function is used to get user input.
`prompt` takes a string `message` which is displayed to the user before reading
input.

```ptls --input Theo
name = prompt("Enter name: ")
"Hello $name!"
```

The value returned by `prompt` will always be strings. You can use the
`Str.parse` function to convert inputs to other
[primitive](/language/misc#primitives) types.

```ptls --input 77
f = Str.parse(prompt("Enter degrees F: "))
c = (f - 32) / 9 * 5
"Degrees C: $c"
```
