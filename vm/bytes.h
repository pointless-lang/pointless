
int
getCharLength(char byte) {
  if ((byte & 0x80) == 0x0 ) return 1;
  if ((byte & 0xe0) == 0xc0) return 2;
  if ((byte & 0xf0) == 0xe0) return 3;
  return 4;
}

// -------------------------------------------------------------------------

int
strGetLength(StringRef* ref) {
  if (!ref->hasLength) {
    int length = 0;
    int index = 0;

    while (index < ref->numBytes) {
      char byte = ref->bytes[index];
      index += getCharLength(byte);
      length++;
      assert(index <= ref->numBytes);
    }

    ref->length = length;
    ref->hasLength = true;
  }

  return ref->length;
}

// -------------------------------------------------------------------------

PtlsValue
getListString(StringRef* ref, int index) {
  assert(index <= ref->numBytes);

  if (index == ref->numBytes) {
    return makeLabel(0); // empty
  }

  char byte = ref->bytes[index];
  int numBytes = getCharLength(byte);

  char* chars = calloc(numBytes, sizeof(char));
  strncpy(chars, &ref->bytes[index], numBytes);

  PtlsValue headChr = makeString(true, numBytes, chars);
  StringRef* newRef = getRef(headChr, stringRef);
  newRef->hasLength = true;
  newRef->length = 1;

  PtlsValue tailChrs = getListString(ref, index + numBytes);

  Thunk head = makeThunkValue(headChr);
  Thunk tail = makeThunkValue(tailChrs);
  return makeCons(head, tail);
}
