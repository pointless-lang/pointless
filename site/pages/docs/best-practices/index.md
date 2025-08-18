---
title: Best Practices
---

These best-practices are meant to help you make effective use of the language features of Pointless. They are recommendations, not strict rules. This guide focuses on the core language, rather than the standard library. For more information on Pointless language features see the language reference.

## Use Compound Assignment

Use compound assignment operators when possible.

```ptls --no-eval --class good
score += 1
price |= round
```

```ptls --no-eval --class bad
score = score + 1
price = round(price)
```

## Avoid Getter Functions

Use built-in syntax to access list elements, object values, and table rows and columns.

```ptls --no-eval --class good
games[0].score
```

```ptls --no-eval --class bad
Obj.get(Table.get(games, 0), "score")
```

## Avoid Setter Functions

Use variable updates instead of setter functions to transform data structures.

```ptls --no-eval --class good
evilTwin = player
evilTwin.malice = 100

player.enemies += 1
```

```ptls --no-eval --class bad
evilTwin = Obj.set(player, "malice", 100)

player = Obj.set(player, "enemies", player.enemies + 1)
```

_Note that the code in the first code block is equivalent to the code in the
second. In Pointless, assignment statements like those in the first code block
mutate variable bindings, not the data structures themselves, so you don't have
to worry about variable aliasing issues like you would in other languages._

## Don't Update via Concatenation

Use variable updates instead of object concatenation to update
[record objects](/docs/language/objects#record-objects).

```ptls --no-eval --class good
player.health += 1
```

```ptls --no-eval --class bad
player += { health: player.health + 1 }
```

## Use Objects to Represent Records

Use objects to represent [records](/docs/language/objects#record-objects)
(structures with a fixed number of entries that each have a distinct role). Do
not use lists as records.

```ptls --no-eval --class good
point = { x: 1, y: 2 }
card = { value: 10, suit: "hearts" }
```

```ptls --no-eval --class bad
point = [1, 2]
card = [10, "hearts"]
```

## Use Key Punning

Use object key punning when setting an object key to a variable of the same
name.

```ptls --no-eval --class good
point = { x, y }
```

```ptls --no-eval --class bad
point = { x: x, y: y }
```

## Omit String Key Quotes

Omit quotes for keys in [record objects](/docs/language/objects#record-objects).

```ptls --no-eval --class good
{ city: "Chicago", state: "IL", population: 2721308 }
```

```ptls --no-eval --class bad
{ "city": "Chicago", "state": "IL", "population": 2721308 }
```

## Use Identifier Record Keys and Columns

Use valid identifiers as [record object](/docs/language/objects#record-objects)
keys and table columns.

```ptls --no-eval --class good
{ userName: "Clementine", userId: 0 }

Table.of([
  { userName: "Clementine", userId: 0 },
  { userName: "Ducky", userId: 1 },
])
```

```ptls --no-eval --class bad
{ "user name": "Clementine", "user-id": 0 }

Table.of([
  { "user name": "Clementine", "user-id": 0 },
  { "user name": "Ducky", "user-id": 1 },
])
```

## Use Dot Syntax

Use `.` syntax for object keys and table columns when possible.

```ptls --no-eval --class good
city.name
```

```ptls --no-eval --class bad
city["name"]
```

## Don't Use Lists as Tables

Use tables to store lists of objects with matching keys.

```ptls --no-eval --class good
Table.of([
  { city: "New York", state: "NY", population: 8478072 },
  { city: "Los Angeles", state: "CA", population: 3878704 },
  { city: "Chicago", state: "IL", population: 2721308 },
  { city: "Houston", state: "TX", population: 2390125 },
])
```

```ptls --no-eval --class bad
[
  { city: "New York", state: "NY", population: 8478072 },
  { city: "Los Angeles", state: "CA", population: 3878704 },
  { city: "Chicago", state: "IL", population: 2721308 },
  { city: "Houston", state: "TX", population: 2390125 },
]
```

## Use Row Lookups

Use the row lookup feature of tables to find individual rows based on unique
field values.

```ptls --no-eval --class good
philly = cities[{ name: "Philadelphia" }]
```

```ptls --no-eval --class bad
philly = (cities ? arg.name == "Philadelphia")[0]
```

## Use Column Operations

When possible, structure table updates around columns rather than rows.

```ptls --no-eval --class good
products.price $= arg - 1
```

```ptls --no-eval --class bad
products $= arg + { price: arg.price - 1 }
```

## Avoid Zero Length Check

Use `isEmpty` instead of `len(...) == 0` to check for empty data structures.

```ptls --no-eval --class good
isEmpty(playlist)
```

```ptls --no-eval --class bad
len(playlist) == 0
```

## Use Push for Single Items

Use `push` to append a single item to a list or table instead of concatenation.

```ptls --no-eval --class good
numbers |= push(n)
```

```ptls --no-eval --class bad
numbers += [n]
```

## Use Negative Indices

Use negative indices to access items from the end of a list or table.

```ptls --no-eval --class good
items[-1]
```

```ptls --no-eval --class bad
items[len(items) - 1]
```

## Use Star to Repeat Values

Use the `*` operator to repeat strings and list elements.

```ptls --no-eval --class good
":)" * 4
[0] * 10
```

```ptls --no-eval --class bad
":):):):)"
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

## Use String Interpolation

Use string interpolation instead of concatenation.

```ptls --no-eval --class good
"Hello $person.name!"
```

```ptls --no-eval --class bad
"Hello " + person.name + "!"
```

## Omit Interpolation Parentheses

Omit unnecessary parentheses around interpolated variables.

```ptls --no-eval --class good
"$price dollars for a pair of socks!?"
```

```ptls --no-eval --class bad
"$(price) dollars for a pair of socks!?"
```

## Use Raw Strings

Use raw strings to avoid excessive escape sequences.

```ptls --no-eval --class good
r"C:\Users\Ducky\Documents"
```

```ptls --no-eval --class bad
"C:\\Users\\Ducky\\Documents"
```

## Minimize Raw String Escape Levels

Omit unnecessary levels of raw string quote escaping.

```ptls --no-eval --class good
r#"Hello "world!""#
```

```ptls --no-eval --class bad
r##"Hello "world!""##
```

## Use Multi-Line Strings

Use multi-line strings when they make string contents clearer.

```ptls --no-eval --class good
"
▓▓  ▓▓▓ ▓    ▓▓
▓ ▓  ▓  ▓   ▓
▓▓   ▓  ▓    ▓
▓    ▓  ▓     ▓
▓    ▓  ▓▓▓ ▓▓
"
```

```ptls --no-eval --class bad
"▓▓  ▓▓▓ ▓    ▓▓\n▓ ▓  ▓  ▓   ▓\n▓▓   ▓  ▓    ▓\n▓    ▓  ▓     ▓\n▓    ▓  ▓▓▓ ▓▓"
```

## Use Multi-Line String Alignment

Leverage the automatic trimming and alignment behavior of multi-line strings to
format code more legibly.

```ptls --no-eval --class good
if printPtls then
  print("
  ▓▓  ▓▓▓ ▓    ▓▓
  ▓ ▓  ▓  ▓   ▓
  ▓▓   ▓  ▓    ▓
  ▓    ▓  ▓     ▓
  ▓    ▓  ▓▓▓ ▓▓
  ")
end
```

```ptls --no-eval --class bad
if printPtls then
  print("▓▓  ▓▓▓ ▓    ▓▓
▓ ▓  ▓  ▓   ▓
▓▓   ▓  ▓    ▓
▓    ▓  ▓     ▓
▓    ▓  ▓▓▓ ▓▓")
end
```

_These two strings produce the same output. For details see
[multi-line strings](/docs/language/strings#multi-line-strings)._

## Avoid Redundant Booleans

Don't include redundant boolean comparisons in logical expressions.

```ptls --no-eval --class good
if item.onSale then
  print(item.price / 2)
end
```

```ptls --no-eval --class bad
if item.onSale == true then
  print(item.price / 2)
end
```

## Use Not

Use `not` instead of `== false`.

```ptls --no-eval --class good
if not Math.isInt(quantity) then
  print("quantity must be a whole number")
end
```

```ptls --no-eval --class bad
if Math.isInt(quantity) == false then
  print("quantity must be a whole number")
end
```

## Use Boolean Parentheses

Use parentheses in expressions that mix different boolean operators (`and`,
`or`, or `not`).

```ptls --no-eval --class good
isGood and (isFast or isCheap)
```

```ptls --no-eval --class bad
isGood and isFast or isCheap
```

## Use Set Membership

Use sets instead of lists to store a large number of values on which you
will be calling `has`.

```ptls --no-eval --class good
scrabbleWords = Set.of(import "lines:scrabble-dict.txt")

has(scrabbleWords, "yeet")
```

```ptls --no-eval --class bad
scrabbleWords = import "lines:scrabble-dict.txt"

has(scrabbleWords, "yeet")
```

## Use Match

Use `match` instead of `if` when matching an expression to three or more
possible values.

```ptls --no-eval --class good
match spin
  case "gimel" then
    score += pot
    pot = 0
  case "hei" then
    score += Math.ceil(pot / 2)
    pot -= Math.ceil(pot / 2)
  case "shin" then
    score -= 1
    pot += 1
end
```

```ptls --no-eval --class bad
if spin == "gimel" then
  score += pot
  pot = 0
elif spin == "hei" then
  score += Math.ceil(pot / 2)
  pot -= Math.ceil(pot / 2)
elif spin == "shin" then
  score -= 1
  pot += 1
end
```

## Avoid Nested Conditionals

Flatten nested conditionals when possible.

```ptls --no-eval --class good
if n > 0 then
  "positive"
elif n < 0 then
  "negative"
else
  "zero"
end
```

```ptls --no-eval --class bad
if n > 0 then
  "positive"
else
  if n < 0 then
    "negative"
  else
    "zero"
  end
end
```

## Refactor Conditional Assignments

Lift variable assignments outside of simple conditionals.

```ptls --no-eval --class good
sweetener =
  if diet == "vegan" then
    "agave"
  else
    "honey"
  end
```

```ptls --no-eval --class bad
if diet == "vegan" then
  sweetener = "agave"
else
  sweetener = "honey"
end
```

## Use Pipelines

Refactor nested function calls into pipeline syntax when possible.

```ptls --no-eval --class good
games
  | Table.summarize("team", getStats)
  | sortDescBy("winPct")
  | print
```

```ptls --no-eval --class bad
print(sortDescBy(Table.summarize(games, "team", getStats), "winPct"))
```

## Use Map and Filter Operators

Use the map `$` and filter `?` operators instead of `map` and `filter`
functions.

```ptls --no-eval --class good
numbers ? Math.isEven $ arg / 2
```

```ptls --no-eval --class bad
List.map(List.filter(numbers, Math.isEven), fn(n) n * 2 end)
```

## Omit Pipe Parentheses

Omit parentheses for single-argument functions in pipelines.

```ptls --no-eval --class good
numbers
  $ Math.sqrt
  | print
```

```ptls --no-eval --class bad
numbers
  $ Math.sqrt()
  | print()
```

## Avoid Anonymous Functions

Use top-level function definitions instead of anonymous functions.

```ptls --no-eval --class good
fn distance(point, center)
  dx = point.x - center.x
  dy = point.y - center.y
  Math.sqrt(dx ** 2 + dx ** 2)
end

fn averageDistance(points, center)
  points
    $ distance(center)
    | List.average
end
```

```ptls --no-eval --class bad
fn averageDistance(points, center)
  distance = fn(point)
    dx = point.x - center.x
    dy = point.y - center.y
    Math.sqrt(dx ** 2 + dx ** 2)
  end

  points
    $ distance
    | List.average
end
```

## Use Arg in Pipelines

Use `arg` in function pipelines instead of anonymous functions.

```ptls --no-eval --class good
words $ translations[arg]
```

```ptls --no-eval --class bad
words $ fn(word) translations[word] end
```

## Put the Most Important Parameter First

Put the most important parameter first in a function definition. If a function
could be described as transforming, accessing, or analyzing one of its
arguments, then that argument is probably the most important.

```ptls --no-eval --class good
fn swap(list, indexA, indexB)
  -- Transform `list` by swapping the values at `indexA` and `indexB`
end

fn startsWith(string, prefix)
  -- Check if `string` starts with `prefix`
end
```

```ptls --no-eval --class bad
fn swap(indexA, indexB, list)
  -- Transform `list` by swapping the values at `indexA` and `indexB`
end

fn startsWith(prefix, string)
  -- Check if `string` starts with `prefix`
end  
```

## Write Pure Functions

Write pure (side effect free) functions when possible.

```ptls --no-eval --class good
fn showTask(task)
  if task.done then
    "[x] $task.name"
  else
    "[ ] $task.name"
  end
end

tasks
  $ showTask
  $ print
```

```ptls --no-eval --class bad
fn printTask(task)
  if task.done then
    print("[x] $task.name")
  else
    print("[ ] $task.name")
  end
end

tasks $ printTask
```

## Avoid Unnecessary Returns

Don't use `return` for the final expression in a function.

```ptls --no-eval --class good
fn sqrt(n)
  n ** 0.5
end

fn min(a, b)
  if a < b then a else b end
end
```

```ptls --no-eval --class bad
fn sqrt(n)
  return n ** 0.5
end

fn min(a, b)
  if a < b then
    return a
  else
    return b
  end
end
```

## Avoid Early Returns

Don't use early `return` statements that don't simplify your code.

```ptls --no-eval --class good
fn min(a, b)
  if a < b then a else b end
end
```

```ptls --no-eval --class bad
fn min(a, b)
  if a < b then
    return a
  end

  b
end
```

## Avoid Else After Return

Refactor code to avoid using `elif` or `else` after a return statement.

```ptls --no-eval --class good
fn findOdd(numbers)
  for n in numbers do
    if Math.isOdd(n) then
      return n
    end

    print("Skipped $n")
  end
end
```

```ptls --no-eval --class bad
fn findOdd(numbers)
  for n in numbers do
    if Math.isOdd(n) then
      return n
    else
      print("Skipped $n")
    end
  end
end
```

## Use Specific Functions

If a function exists that specifically accomplishes a desired task, choose it over more
general functions.

```ptls --no-eval --class good
chars("Hello world!")
pop(items)
```

```ptls --no-eval --class bad
split("Hello world!", "")
dropLast(items, 1)
```

## Omit Module Prefixes

Omit module prefixes when calling global functions.

```ptls --no-eval --class good
print("Hello world!")
```

```ptls --no-eval --class bad
Console.print("Hello world!")
```

## Don't Shadow Globals

Don't shadow global built-in functions.

```ptls --no-eval --class good
message = "Enter a rating 1-5: "
maximum = 5
```

```ptls --no-eval --class bad
prompt = "Enter a rating 1-5: "
max = 5
```

## Use Camel Case

Use camel case for multi-word variable, function, and [record objects](/docs/language/objects#record-objects) key names. Don't capitalize single-word names.

```ptls --no-eval --class good
gameState = "paused"

fn point(x, y)
  { x, y }
end
```

```ptls --no-eval --class bad
gamestate = "paused"

fn Point(x, y)
  { x, y }
end
```

## Don't Use Uppercase for Constants

Don't use uppercase names for constants.

```ptls --no-eval --class good
pi = 3.141592654
```

```ptls --no-eval --class bad
PI = 3.141592654
```

## Use Zero for Decimals

Include a leading `0` in decimal literals for numbers between `0` and `1`.

```ptls --no-eval --class good
n = 0.1
```

```ptls --no-eval --class bad
n = .1
```

## Use Trailing Commas in Data Structures

Include a comma after the last item in a list or object expression spanning
multiple lines.

```ptls --no-eval --class good
days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
]
```

```ptls --no-eval --class bad
days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
]
```

## Omit Trailing Commas for Function Arguments

Don't include a comma after the last argument in a function call spanning
multiple lines.

```ptls --no-eval --class good
split(
  "Lunes Martes Miércoles Jueves Viernes Sábado Domingo",
  " "
)
```

```ptls --no-eval --class bad
split(
  "Lunes Martes Miércoles Jueves Viernes Sábado Domingo",
  " ",
)
```

## Avoid Import Side Effects

Library code should not have side effects when imported.

```ptls --no-eval --class good
fn maximum(a, b)
  if a > b then a else b end
end

fn showInfo()
  print("Maximum™ Version 1.0, patent pending")
end

{ maximum, showInfo }
```

```ptls --no-eval --class bad
fn maximum(a, b)
  if a > b then a else b end
end

print("Maximum™ Version 1.0, patent pending")

{ maximum }
```

## Export Objects

Export objects instead of individual definitions.

```ptls --no-eval --class good
fn maximum(a, b)
  if a > b then a else b end
end

{ maximum }
```

```ptls --no-eval --class bad
fn maximum(a, b)
  if a > b then a else b end
end

maximum
```

## Use Fixed-Path Imports

Use `import` to load files from a fixed path relative to your source file.

```ptls --no-eval --class good
story = import "text:alice.txt"
```

```ptls --no-eval --class bad
-- Won't work if script is called outside the source directory
story = Fs.read("alice.txt")
```

## Use Import Directives

Use import directives when they simplify your code.

```ptls --no-eval --class good
story = import "lines:alice.txt"
```

```ptls --no-eval --class bad
story = Str.lines(import "text:alice.txt")
```

## Use Anonymous Loops

Omit unnecessary loop variables.

```ptls --no-eval --class good
for 10 do
  print("loading")
end
```

```ptls --no-eval --class bad
for n in range(10) do
  print("loading")
end
```

## Use Loop Index Variables

Use a second loop variable to track indices when looping over lists or tables.

```ptls --no-eval --class good
for player, index in rankings do
  print("$index $player")
end
```

```ptls --no-eval --class bad
index = 0

for player in rankings do
  print("$index $player")
  index += 1
end
```

## Use Loop Value Variables

Use a second loop variable to track values when looping over objects.

```ptls --no-eval --class good
for item, quantity in inventory do
  print("$item x $quantity")
end
```

```ptls --no-eval --class bad
for item in inventory do
  quantity = inventory[item]
  print("$item x $quantity")
end
```
