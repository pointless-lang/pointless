
#pragma once
#include <stdint.h>

// ---------------------------------------------------------------------------
// "evil floating point bit level hacking"
// need to store child double values as ints while avoiding cast

int64_t
fromDouble(double f);

// ---------------------------------------------------------------------------

double
toDouble(int64_t i);
