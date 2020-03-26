
PtlsValue
handleBuiltIn(BuiltInRef* ref, PtlsValue arg) {
  
  if (ref->fieldInd == getZerosInd) {
    assert(ref->value.type == Val_Label);
    assert(ref->value.value == strLiteralIndex("PtlsArray"));

    checkType("Built in method 'getZeros'", Val_Number, arg);
    int length = arg.value;

    PtlsValue* elems = calloc(length, sizeof(PtlsValue));
    PtlsValue result = makeArray(length, elems);

    while (length--) {
      elems[length] = makeNumber(0);
    }
    
    return result;
  }

  // -------------------------------------------------------------------------

  if (ref->fieldInd == getAddElemInd) {
    assert(ref->value.type == Val_Set);
    SetRef* setRef = getRef(ref->value, setRef);
    mapAddKey(setRef->elems, arg);
    return ref->value;
  }

  // -------------------------------------------------------------------------

  if (ref->fieldInd == getDelElemInd) {
    assert(ref->value.type == Val_Set);
    SetRef* setRef = getRef(ref->value, setRef);
    mapRemove(setRef->elems, arg);
    return ref->value;
  }

  // -------------------------------------------------------------------------

  if (ref->fieldInd == getDelKeyInd) {
    assert(ref->value.type == Val_Map);
    MapRef* mapRef = getRef(ref->value, mapRef);
    mapRemove(mapRef->table, arg);
    return ref->value;
  }

  // -------------------------------------------------------------------------

  assert(false);
}
