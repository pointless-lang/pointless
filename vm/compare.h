
bool
valsEqual(PtlsValue a, PtlsValue b) {
  if (a.type != b.type) {
    return false;
  }

  // -------------------------------------------------------------------------

  if (isPrimitive(a)) {
    return a.value == b.value;
  }

  // -------------------------------------------------------------------------

  if (a.type == Val_String) {
    StringRef* aRef = getRef(a, stringRef);
    StringRef* bRef = getRef(b, stringRef);

    if (aRef->numBytes != bRef->numBytes) {
      return false;
    }
    return strncmp(aRef->bytes, bRef->bytes, aRef->numBytes) == 0;
  }

  // -------------------------------------------------------------------------

  if (a.type == Val_Tuple) {
    TupleRef* aRef = getRef(a, tupleRef);
    TupleRef* bRef = getRef(b, tupleRef);

    if (aRef->hasLabel != bRef->hasLabel) {
      return false;
    }

    // compare labels by value (pointer to strings)
    // duplicate strings in source interned to same vm string index
    if (aRef->hasLabel && aRef->label.value != bRef->label.value) {
      return false;
    }

    if (aRef->length != bRef->length) {
      return false;
    }

    for (int index = 0; index < aRef->length; index++) {
      if (!valsEqual(aRef->members[index], bRef->members[index])) {
        return false;
      }
    }
    return true;
  }

  return a.ref == b.ref;
}

// ---------------------------------------------------------------------------

uint64_t
hashValue(PtlsValue value) {
  uint64_t result = hashInit();
  result = hashWord(result, value.type);

  // -------------------------------------------------------------------------

  if (isPrimitive(value)) {
    return hashWord(result, value.value);
  }

  // -------------------------------------------------------------------------

  if (value.type == Val_String) {
    StringRef* ref = getRef(value, stringRef);

    for (int index = 0; index < ref->numBytes; index++) {
      result = hashWord(result, ref->bytes[index]);
    }
    return result;
  }
  
  // -------------------------------------------------------------------------

  if (value.type == Val_Tuple) {
    TupleRef* ref = getRef(value, tupleRef);
    result = hashWord(result, ref->label.value);

    for (int index = 0; index < ref->length; index++) {
      result = hashWord(result, hashValue(ref->members[index]));
    }
    return result;
  }

  return hashWord(result, (uint64_t)value.ref);
}
