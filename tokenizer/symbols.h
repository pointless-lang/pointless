
typedef struct {
  char* sym;
  TokenType tokType;
} Pair;

// ---------------------------------------------------------------------------
// language keywords, operators, and symbols, and associated token types

Pair keywords[] = {
  {"if",        Tok_If       },
  {"then",      Tok_Then     },
  {"else",      Tok_Else     },
  {"where",     Tok_Where    },
  {"with",      Tok_With     },
  {"switch",    Tok_Switch   },
  {"case",      Tok_Case     },
  {"otherwise", Tok_Otherwise},
  {"and",       Tok_And      },
  {"or",        Tok_Or       },
  {"not",       Tok_Not      },
  {"in",        Tok_In       },
  {"is",        Tok_Is       },
  {"as",        Tok_As       },
  {"true",      Tok_Bool     },
  {"false",     Tok_Bool     },
  {"for",       Tok_For      },
  {"when",      Tok_When     },
  {"yield",     Tok_Yield    },
  {"requires",  Tok_Requires },
  {"import",    Tok_Import   },
  {NULL,        Tok_NULL     },
};

Pair opSyms[] = {
  {"+",   Tok_Add        }, 
  {"-",   Tok_Sub        }, 
  {"*",   Tok_Mul        }, 
  {"/",   Tok_Div        }, 
  {"**",  Tok_Pow        },
  {"%",   Tok_Mod        }, 
  {"+=",  Tok_AddAssign  },
  {"-=",  Tok_SubAssign  },
  {"*=",  Tok_MulAssign  },
  {"/=",  Tok_DivAssign  },
  {"**=", Tok_PowAssign  },
  {"%=",  Tok_ModAssign  },
  {"|>",  Tok_Pipe       }, 
  {"=",   Tok_Assign     }, 
  {"==",  Tok_Equals     }, 
  {"!=",  Tok_NotEq      }, 
  {"<",   Tok_LessThan   }, 
  {">",   Tok_GreaterThan}, 
  {"<=",  Tok_LessEq     }, 
  {">=",  Tok_GreaterEq  }, 
  {"=>",  Tok_Lambda     }, 
  {"$",   Tok_Dollar     }, 
  {"++",  Tok_Concat     },
  {NULL,  Tok_NULL       },
};

// keep left and right separate to help keep track of
// when tokenizer is at the start of a new expression
// used to disambiguate negation and subtraction
Pair leftSyms[] = {
  {"(",  Tok_LParen  },
  {"{",  Tok_LBracket},
  {"[",  Tok_LArray  },
  {NULL, Tok_NULL    },
};

Pair rightSyms[] = {
  {")",  Tok_RParen  }, 
  {"}",  Tok_RBracket},
  {"]",  Tok_RArray  },
  {NULL, Tok_NULL    },
};

Pair separators[] = {
  {";",  Tok_Semicolon},
  {":",  Tok_Colon    },
  {",",  Tok_Comma    },
  {NULL, Tok_NULL     },
};
