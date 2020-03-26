
#include <assert.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdio.h>
#include <math.h>
#include <stdint.h>

// -----------------------------------------------------------------------------

bool
valsEqual(PtlsValue a, PtlsValue b);

uint64_t
hashValue(PtlsValue value);

// -----------------------------------------------------------------------------

typedef struct HashNode {
  PtlsValue key;
  PtlsValue val;
  bool hasVal;
  struct HashNode* next;
} HashNode;

// -----------------------------------------------------------------------------

struct HashMap {
  int length; // length of the table
  int numElems;
  HashNode** table;
};

typedef struct HashMap HashMap;

// -----------------------------------------------------------------------------

uint64_t FNVBasis = 0xcbf29ce484222325;
uint64_t FNVPrime = 0x100000001b3;

// -----------------------------------------------------------------------------

int64_t
hashInit(void) {
  return FNVBasis;
}

// -----------------------------------------------------------------------------
// FNV hash algorithm takes one byte at a type

// FNV-1a
uint64_t
hashStep(uint64_t result, char byte) {
  result = result ^ byte;
  result = result * FNVPrime;
  return result;
} 

// -----------------------------------------------------------------------------
// Hash one word at a type

uint64_t
hashWord(uint64_t result, uint64_t word) {
  for (int shift = 0; shift < 64; shift += 32) {
    result = hashStep(result, ((word >> shift) & 0xff));
  }
  return result;
} 

// -----------------------------------------------------------------------------

bool
compareKeys(PtlsValue a, PtlsValue b) {
  return valsEqual(a, b);
}

// -----------------------------------------------------------------------------

HashNode*
makeHashNode(PtlsValue key, PtlsValue value, bool hasVal) {
  HashNode* node = calloc(1, sizeof(HashNode));
  *node = (HashNode){key, value, hasVal, NULL};
  return node;
}

// -----------------------------------------------------------------------------

int minLength = 8;

HashMap*
makeHashMap(void) {
  HashMap* map = calloc(1, sizeof(HashMap));
  HashNode** table = calloc(minLength, sizeof(HashNode*));
  *map = (HashMap){minLength, 0, table};
  return map;
}

// -----------------------------------------------------------------------------

void
freeNode(HashNode* node) {
  free(node);
}

// -----------------------------------------------------------------------------

void
freeNodes(HashNode* node) {
  if (!node) {
    return;
  }
  freeNodes(node->next);
  freeNode(node);
}

// -----------------------------------------------------------------------------

void
freeTable(HashNode** table, int length) {
  for (int index = 0; index < length; index++) {
    freeNodes(table[index]);
  }
  free(table);
}

// -----------------------------------------------------------------------------

void
freeHashMap(HashMap* map) {
  freeTable(map->table, map->length);
  free(map);
}

// -----------------------------------------------------------------------------

void
checkMap(HashMap* map);

// -----------------------------------------------------------------------------

PtlsValue
mapGet(HashMap* map, PtlsValue key) {
  int index = hashValue(key) % map->length;

  HashNode* node = map->table[index];
  while (!compareKeys(node->key, key)) {
    node = node->next;
    assert(node);
  }
  return node->val;
}

// -----------------------------------------------------------------------------

bool
mapHasKey(HashMap* map, PtlsValue key) {
  int index = hashValue(key) % map->length;
  HashNode* node = map->table[index];
  while (node && !compareKeys(node->key, key)) {
    node = node->next;
  }
  return node != NULL;
}

// -----------------------------------------------------------------------------

bool
mapRemove(HashMap* map, PtlsValue key) {
  if (!mapHasKey(map, key)) {
    return false;
  }

  int index = hashValue(key) % map->length;

  HashNode* node = map->table[index];
  if (compareKeys(node->key, key)) {
    map->table[index] = node->next;
    map->numElems--;
    freeNode(node);
    checkMap(map);
    return true;
  }

  while (!compareKeys(node->next->key, key)) {
    assert(node->next->next);
    node = node->next;
  }

  HashNode* newNext = node->next->next;
  freeNode(node->next);
  node->next = newNext;
  map->numElems--;
  checkMap(map);
  return true;
}

// -----------------------------------------------------------------------------

bool
mapAddNoCheck(HashMap* map, PtlsValue key, PtlsValue value, bool hasVal) {
  bool previous = mapRemove(map, key);
  map->numElems++;

  int index = hashValue(key) % map->length;

  HashNode* oldNode = map->table[index];
  HashNode* newNode = makeHashNode(key, value, hasVal);
  newNode->next = oldNode;
  map->table[index] = newNode;
  
  return previous;
}

// -----------------------------------------------------------------------------

bool
mapAdd(HashMap* map, PtlsValue key, PtlsValue value) {
  bool result = mapAddNoCheck(map, key, value, true);
  checkMap(map);
  return result;
}

// -----------------------------------------------------------------------------

bool
mapAddKey(HashMap* map, PtlsValue key) {
  bool result = mapAddNoCheck(map, key, (PtlsValue){0}, false);
  checkMap(map);
  return result;
}

// -----------------------------------------------------------------------------

void
mapGetKeys(HashMap* map, PtlsValue* keys) {
  int keyIndex = 0;
  for (int index = 0; index < map->length; index++) {
    HashNode* node = map->table[index];
    while (node) {
      keys[keyIndex++] = node->key;
      node = node->next;
    }
  }
}

// -----------------------------------------------------------------------------

void
mapGetVals(HashMap* map, PtlsValue* vals) {
  int valIndex = 0;
  for (int index = 0; index < map->length; index++) {
    HashNode* node = map->table[index];
    while (node) {
      vals[valIndex++] = node->val;
      node = node->next;
    }
  }
}

// -----------------------------------------------------------------------------

void
resizeMap(HashMap* map, float scaleFactor) {
  int oldLength = map->length;
  int newLength = oldLength * scaleFactor;

  newLength = newLength < minLength ? minLength : newLength;

  HashNode** oldTable = map->table;
  HashNode** newTable = calloc(newLength, sizeof(HashNode*));

  map->table = newTable;
  map->length = newLength;
  map->numElems = 0;

  for (int index = 0; index < oldLength; index++) {
    HashNode* node = oldTable[index];
    while (node) {
      mapAddNoCheck(map, node->key, node->val, node->hasVal);
      node = node->next;
    }
  }
  
  freeTable(oldTable, oldLength);
}

// -----------------------------------------------------------------------------

void
checkMap(HashMap* map) {
  if (map->numElems < map->length / 4 && map->length >= minLength * 4) {
    resizeMap(map, .5);

  } else if (map->numElems > map->length) {
    resizeMap(map, 2);
  }
}
