
int ArrayLabelInd;
int BoolLabelInd;
int ListLabelInd;
int FuncLabelInd;
int LabelLabelInd;
int MapLabelInd;
int NumberLabelInd;
int ObjectLabelInd;
int SetLabelInd;
int StringLabelInd;
int BuiltInLabelInd;
int TupleLabelInd;

void initLabels(void) {
  ArrayLabelInd = strLiteralIndex("PtlsArray");
  BoolLabelInd = strLiteralIndex("PtlsBool");
  ListLabelInd = strLiteralIndex("PtlsList");
  FuncLabelInd = strLiteralIndex("PtlsFunc");
  LabelLabelInd = strLiteralIndex("PtlsLabel");
  MapLabelInd = strLiteralIndex("PtlsMap");
  NumberLabelInd = strLiteralIndex("PtlsNumber");
  ObjectLabelInd = strLiteralIndex("PtlsObject");
  SetLabelInd = strLiteralIndex("PtlsSet");
  StringLabelInd = strLiteralIndex("PtlsString");
  BuiltInLabelInd = strLiteralIndex("PtlsBuiltIn");
  TupleLabelInd = strLiteralIndex("PtlsTuple");
}
