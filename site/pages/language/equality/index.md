---
title: "Language Reference: Equality"
subtitle: When are values considered equal
---

## Operators

The equals `==` operator can be used to check if two values are equal.

```ptls
1 + 4 == 5
```

The not-equals `!=` operator can be used to check if two values are not equal.

```ptls
1 + 4 != 14
```

## Definition

Equality in Pointless obeys the following rules:

- Values of different types are never equal.

  ```ptls
  "0" == 0
  true == 1
  ```

- `true`, `false`, and `none` are equal to themselves.

  ```ptls
  true == true
  false == false
  none == none
  ```

- Numbers are equal if they have the same value.

  ```ptls
  1e2 == 100.0
  42 == 7
  ```

- Strings are equal if they contain the same characters in the same order.

  ```ptls
  "hello" == "hello"
  "Hello!" == "hello?"
  ```

- Lists are equal if they contain the same elements in the same order.

  ```ptls
  ["a", "b", "c"] == ["a", "b", "c"]
  ["a", "b", "c"] == ["a", "c", "b"]
  ```

- Sets are equal if they contain the same values, regardless of order.

  ```ptls
  Set.of([0, 1]) == Set.of([1, 0])
  Set.of([0, 1]) == Set.of([2, 1, 0])
  ```

- Objects are equal if they contain the same key-value pairs, regardless of
  order.

  ```ptls
  { city: "Boston", state: "MA" } == { state: "MA", city: "Boston" }
  { county: "Suffolk", state: "MA" } == { city: "Boston", state: "MA" }
  ```

- Tables are equal if their row lists (lists whose elements are row objects) are
  equal. Equivalently, tables are equal if their column objects (objects whose
  keys are column names and whose values are lists of each column's values) are
  equal.

  ```ptls
  t1 = Table.of([{ state: "CA", rank: 1 }, { state: "TX", rank: 2 }])
  t2 = Table.of({ state: ["CA", "TX"], rank: [1, 2] })
  t1 == t2

  t3 = Table.of({ state: ["CA", "TX"], rank: [1, 2] })
  t4 = Table.of({ state: ["TX", "CA"], ranking: [1, 2] })
  t3 == t4
  ```

- A function is equal to itself. Two functions which do different things are not
  equal. Two functions which do the same thing may or may not be equal.

  ```ptls
  fn inc(n)
    n + 1
  end

  inc == inc

  inc == fn(n) n * 3 end

  fn(n) n * 3 end == fn(n) n * 3 end -- May or may not be equal
  ```

- A ref is only ever equal to itself. Two different refs are not equal, even if
  they contain the same value.

  ```ptls
  ref = Ref.of(0)
  ref == ref
  ref == Ref.of(0)
  ```

- Equality is defined recursively for
  [data structures](../misc#data-structures). Values inside these structures are
  compared using these same rules.
