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

Attempting to access a variable which has not been defined will cause an error.

```ptls --panics
1 - salePrice / normalPrice
```

## Redefining Variables

Variables can updated after being initially defined. The syntax for redefining
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

Compound assignment also works with pipeline operators.

```ptls
cmpPct = 27 / 43
cmpPct |= Math.roundTo(3) -- Equivalent to cmpPct = Math.roundTo(cmpPct, 3)
```

The available compound assignment operators are `+=`, `-=`, `*=`, `/=`, `**=`,
`%=`, `|=`, `$=`, and `?=`.

## Variable Scope

Pointless is _function-scoped_, meaning that functions determine the scope of
variables.

Variables defined outside of functions are _globals_, and can be accessed by any
functions or other code in the program once they are defined.

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
score = 0

fn incScore()
  -- Changes the value of `score` within the function, making a new local
  -- definition and leaving the global definition for `score` unchanged.
  score += 1
  score
end

incScore() -- The updated `score` value returned from `incScore`
score -- Value of the global variable hasn't changed
```

## Structural Updates

_Note: the following section covers one of the more subtle and significant
features of Pointless. You can learn more about the development of this language
feature [here](/articles/solving-structural-updates/)._

In Pointless, we can use assignment syntax to update
[lists](/language/lists/#updates), [objects](/language/objects/#updates), and
[tables](/language/tables/#updates).

```ptls
hero = { name: "Lilah", score: 0, items: [none] }

hero.score += 1 -- Increment the `score` value in `hero`
hero.items[0] = "food" -- Replace the first value in the `items` list in `hero`
```

This update syntax looks similar to what you'd see in other scripting languages
like JavaScript or Python, but there's an important difference: data structures
in Pointless are _immutable_. When the language evaluates these two lines:

```ptls --no-eval
hero.score += 1
hero.items[0] = "food"
```

the underlying object and list aren't modified directly. Instead, the language
makes copies of the data structures with the new values inserted, and reassigns
the variable `hero` to reference those new structures. We could rewrite the code
above using the setter functions `Obj.set` and `List.set`, which make this
process more explicit, but which ultimately do the same thing.

```ptls --no-eval
hero = Obj.set(hero, "score", hero.score + 1)
hero = Obj.set(hero, "items", List.set(hero.items, 0, "food"))
```

In Pointless, **variables** are **mutable** and **data** is **immutable**. This
is similar in principle to the _copy on write_ behavior found in some imperative
languages.

Why does this distinction matter? To demonstrate, let's make a second variable
`twin` referencing our original `hero` object before any modifications. After we
update `hero`, we can see that our updates only modified the `hero` variable,
while `twin` remains unchanged.

```ptls
hero = { name: "Lilah", score: 0, items: [none] }
twin = hero

hero.score += 1
hero.items[0] = "food"

hero
twin
```

This property of Pointless means that you don't have to worry about _variable
aliasing_ issues like you would in other languages. It also mean that functions
which update data structures must return those updated structures for the
changes to be visible outside those functions. For example, the function below
does nothing:

```ptls
fn incScore(person)
  -- Updated `person` is only visible within `incScore`
  person.score += 1
end
```

because, while it updates the local variable `person`, the updated object is
only visible within the function `incScore`. For `incScore` to be useful, it
needs to return the updated `person` object.

```ptls
fn incScore(person)
  person.score += 1
  person
end

hero = { name: "Lilah", score: 0, items: [none] }
hero |= incScore
```

Note that, because structural update work by redefining variables, the leftmost
target of the update must be a variable name.

```ptls --panics
fn getHero()
  { name: "Lilah", score: 0, items: [none] }
end

-- Incorrect, can't update a function call
getHero().score += 1
```
