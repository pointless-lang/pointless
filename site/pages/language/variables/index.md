---
title: "Language Reference: Variables"
subtitle: Defining, accessing, and updating variables
---

## Defining Variables

We can use variables to store values. Variables in Pointless are defined using
the assignment `=` operator. Variable names must be valid
[identifiers](misc#identifiers), and must not be [keywords](misc#keywords).

```ptls
-- Store the string "Lilah" in the variable `name`
name = "Lilah"
```

## Accessing Variables

After a variable is defined, it can be used by other pieces of code.

```ptls
points = 90
total = 100

points / total
```

## Reassigning Variables

Variables can updated after being initially defined. The syntax for reassigning
an existing variable is the same as for defining a new variable.

```ptls
score = 0
score = 1
```

## Compound Assignment

Sometimes we want to update an existing variable based on its current value, for
example incrementing a `score` variable.

```ptls
score = 0
score = score + 1
```

We can simplify these sorts of updates using the _compound assignment_ syntax,
which combines a binary opeartor like `+` with the assignment operator `=`.

```ptls
score = 0
score += 1 -- Equivalent to score = score + 1
```

Compound assignment also works with [pipeline operators](../pipelines).

```ptls
cmpPct = 27 / 43
cmpPct |= Math.roundTo(3) -- Equivalent to cmpPct = Math.roundTo(cmpPct, 3)
```

The available compound assignment operators are `+=`, `-=`, `*=`, `/=`, `**=`,
`%=`, `|=`, `$=`, and `?=`.

## Variable Scope

Pointless is _function-scoped_, meaning that functions determine the scope of
variables.

Variables defined outside of functions are _globals_, and can be accessed both
by code within functions and code outside of functions.

```ptls
pi = 3.14 -- Close enough

fn area(radius)
  pi * radius ** 2 -- We can use the global `pi` within the function
end

area(5)
```

Variables defined inside a function, including function parameters, are
_locals_, and are only accessible withing that function.

```ptls --panics
fn distance(x1, y1, x2, y2)
  -- `dx` and `dy` are only defined within the function
  dx = x1 - x2
  dy = y1 - y2
  Math.sqrt(dx ** 2 + dy ** 2)
end

distance(0, 0, 3, 4)

-- Incorrect, we can't access `dx` outside of `distance`
dx
```

Function-scoping means that control structures like conditionals and loops don't
create new scopes. Variables defined within these control structures (including
loop variables) will be accessible outside of the structures.

```ptls
numbers = [1, 2, 3, 4, 5]
total = 0

for n in numbers do
  total += n
end

total
n
```

## Shadowing

Local variables with the same names as globals will _shadow_ those globals.
Defining a local variable inside a function will not change the value of a
global variable with the same name.

```ptls
greeting = "Hello"

fn sayHi()
  -- Changes the value of `greeting` within the function, making a new local
  -- definition and leaving the global definition for `greeting` unchanged
  greeting = "hi"
  "$greeting world!"
end

sayHi()
greeting -- Value of the global variable hasn't changed
```

When a function defines a local variable that shadows a global, code in the
function won't have access the global definition, even if the variable access
precedes the local definition.

```ptls --panics
greeting = "Hello"

fn sayHi()
  -- Invalid, local variable `greeting` is not yet defined and
  -- global `greeting` is shadowed and therefore inaccessible
  print(greeting)
  greeting = "hi"
end

sayHi()
```

## Structural Updates

In Pointless, we can use assignment syntax to update variables containing
[lists](/language/lists/#updates), [objects](/language/objects/#updates), and
[tables](/language/tables/#updates).

```ptls
hero = { name: "Lilah", score: 0, items: [none] }

hero.score += 1 -- Increment the `score` value in `hero`
hero.items[0] = "food" -- Replace the first value in the `items` list in `hero`
```

Note that structural updates like these are still just variable reassignments;
they **do not mutate** the underlying data structures like they would in other
languages. See the chapter on [immutability](../immutability) for more details.
