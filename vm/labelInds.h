
int arrayLabelInd;
int boolLabelInd;
int listLabelInd;
int funcLabelInd;
int labelLabelInd;
int mapLabelInd;
int numberLabelInd;
int objectLabelInd;
int setLabelInd;
int stringLabelInd;
int builtInLabelInd;
int tupleLabelInd;

void initLabels(void) {
  arrayLabelInd = strLiteralIndex("PtlsArray");
  boolLabelInd = strLiteralIndex("PtlsBool");
  listLabelInd = strLiteralIndex("PtlsList");
  funcLabelInd = strLiteralIndex("PtlsFunc");
  labelLabelInd = strLiteralIndex("PtlsLabel");
  mapLabelInd = strLiteralIndex("PtlsMap");
  numberLabelInd = strLiteralIndex("PtlsNumber");
  objectLabelInd = strLiteralIndex("PtlsObject");
  setLabelInd = strLiteralIndex("PtlsSet");
  stringLabelInd = strLiteralIndex("PtlsString");
  builtInLabelInd = strLiteralIndex("PtlsBuiltIn");
  tupleLabelInd = strLiteralIndex("PtlsTuple");
}
