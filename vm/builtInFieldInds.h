
int getAddElemInd;
int getDelElemInd;
int getDelKeyInd;
int getFloatInd;
int getHeadInd;
int getIntInd;
int getLineInd;
int getKeysInd;
int getLabelInd;
int getLengthInd;
int getListInd;
int getMapInd;
int getRandInd;
int getSetInd;
int getStringInd;
int getTailInd;
int getValsInd;
int getZerosInd;

void initBuiltInFields(void) {
  getAddElemInd = strLiteralIndex("!getAddElem");
  getDelElemInd = strLiteralIndex("!getDelElem");
  getDelKeyInd = strLiteralIndex("!getDelKey");
  getFloatInd = strLiteralIndex("!getFloat");
  getHeadInd = strLiteralIndex("!getHead");
  getIntInd = strLiteralIndex("!getInt");
  getLineInd = strLiteralIndex("!getLine");
  getKeysInd = strLiteralIndex("!getKeys");
  getLabelInd = strLiteralIndex("!getLabel");
  getLengthInd = strLiteralIndex("!getLength");
  getListInd = strLiteralIndex("!getList");
  getMapInd = strLiteralIndex("!getMap");
  getRandInd = strLiteralIndex("!getRand");
  getSetInd = strLiteralIndex("!getSet");
  getStringInd = strLiteralIndex("!getString");
  getTailInd = strLiteralIndex("!getTail");
  getValsInd = strLiteralIndex("!getVals");
  getZerosInd = strLiteralIndex("!getZeros");
}
