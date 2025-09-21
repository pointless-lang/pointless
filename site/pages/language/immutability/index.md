---
title: "Language Reference: Immutability"
subtitle:
---

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

ref
