---
title: "The Standard Library: Panic"
type: module
subtitle: Terminate the program upon an unexpected program state
---

In constrast with [errors](../Err) (which signal anticipated error states),
panics are used to indicate an unexpected program state from which recovery is
not possible. Raising a panic terminates the program.
