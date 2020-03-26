
void
printDebug(PtlsValue value) {
  printf("%s", getTypeStr(value.type));

  switch (value.type) {
    case Val_Number: {
      printf("(%.17g)\n", value.value);
      break;
    }

    case Val_Bool: {
      printf("(%s)\n", value.value ? "true" : "false");
      break;
    }

    case Val_Label: {
      printf("(%s)\n", getText(value.value));
      break;
    }

    case Val_String: {
      printf("(\"%s\")\n", getRef(value, stringRef)->bytes);
      break;
    }

    default: {
      printf("(%p)\n", value.ref);
    }
  }
}
