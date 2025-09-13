---
title: "The Standard Library: Ref"
type: module
subtitle: Work with mutable state
---

The core data structures in Pointless are immutable. _References_ serve as
mutable wrappers around these values, allowing programs to leverage mutability.
Note that references **must not reference themselves** (they must not contain
_circular references_) as this could cause memory leaks and infinite recursion.

An example
[pseudorandom number generator](https://en.wikipedia.org/wiki/Linear_congruential_generator)
function that uses a reference to store the generator state.

```ptls
seed = Ref.of(0)

-- Linear congruential generator parameters
m = 2 ** 32
a = 1664525
c = 1013904223

fn random()
  next = (a * Ref.get(seed) + c) % m -- Calculate new seed
  Ref.set(seed, next) -- Store new seed
  next / m -- Return scaled value
end

random()
random()
random()
random()
```
