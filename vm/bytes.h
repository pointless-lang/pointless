
int
strGetLength(StringRef* ref) {
  if (!ref->hasLength) {
    int length = 0;
    int index = 0;

    while (index < ref->numBytes) {
      char byte = ref->bytes[index];

           if ((byte & 0x80) == 0x0)  index += 1;
      else if ((byte & 0xe0) == 0xc0) index += 2;
      else if ((byte & 0xf0) == 0xe0) index += 3;
      else                            index += 4;

      length++;
      assert(index <= ref->numBytes);
    }

    ref->length = length;
    ref->hasLength = true;
  }

  return ref->length;
}
