
#include "convertNum.h"

// ---------------------------------------------------------------------------
// https://stackoverflow.com/a/29867177/6680182
// type-punning with union to avoid float <-> int case

int64_t
fromDouble(double f) {
  union {
    double f;
    int64_t i;
  } u;

  u.f = f;
  return u.i;
}

// ---------------------------------------------------------------------------

double
toDouble(int64_t i) {
  union {
    double f;
    int64_t i;
  } u;

  u.i = i;
  return u.f;
}
