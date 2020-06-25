
import "dart:math";

import "ASTNode.dart";
import "interpreter.dart";
import "ptlsBool.dart";
import "ptlsDict.dart";
import "ptlsError.dart";
import "ptlsList.dart";
import "ptlsNumber.dart";
import "ptlsSet.dart";
import "ptlsString.dart";
import "ptlsValue.dart";
import "tokenTypes.dart";

// ---------------------------------------------------------------------------

PtlsValue handleUnaryOp(env, Tok op, ASTNode operandNode) {

  switch (op) {

    case Tok.Neg: {
      PtlsNumber operand = evalCheck(env, operandNode, [PtlsNumber]);
      return PtlsNumber(-operand.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Not: {
      PtlsBool operand = evalCheck(env, operandNode, [PtlsBool]);
      return PtlsBool(!operand.value);
    }

    // -----------------------------------------------------------------------

    default: throw false;
  }
}

// ---------------------------------------------------------------------------

PtlsValue handleBinaryOp(env, Tok op, ASTNode lhsNode, ASTNode rhsNode) {

  switch (op) {

    case Tok.Concat: {
      PtlsValue lhs = eval(env, lhsNode).checkIsList();
      if (lhs.isEmpty) {
        return eval(env, rhsNode).checkIsList();
      }

      return (lhs as PtlsList).concat(env, rhsNode);
    }

    // -----------------------------------------------------------------------

    case Tok.Or: {
      PtlsBool lhs = evalCheck(env, lhsNode, [PtlsBool]);
      if (lhs.value) {
        return PtlsBool(true);
      }

      var result = evalCheck(env, rhsNode, [PtlsBool]);
      return result;
    }

    // -----------------------------------------------------------------------

    case Tok.And: {
      PtlsBool lhs = evalCheck(env, lhsNode, [PtlsBool]);
      if (!lhs.value) {
        return PtlsBool(false);
      }

      var result = evalCheck(env, rhsNode, [PtlsBool]);
      return result;
    }

    // -----------------------------------------------------------------------

    case Tok.Equals: {
      PtlsValue lhs = eval(env, lhsNode);
      PtlsValue rhs = eval(env, rhsNode);
      return PtlsBool(lhs == rhs);
    }

    // -----------------------------------------------------------------------

    case Tok.NotEq: {
      PtlsValue lhs = eval(env, lhsNode);
      PtlsValue rhs = eval(env, rhsNode);
      return PtlsBool(lhs != rhs);
    }

    // -----------------------------------------------------------------------

    case Tok.In: {
      PtlsValue lhs = eval(env, lhsNode);
      var rhs = evalCheck(env, rhsNode, [PtlsSet, PtlsDict]);
      return PtlsBool(rhs.contains(lhs));
    }

    // -----------------------------------------------------------------------

    case Tok.LessThan: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsBool(lhs.value < rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.LessEq: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsBool(lhs.value <= rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.GreaterThan: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsBool(lhs.value > rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.GreaterEq: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsBool(lhs.value >= rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Add: {
      var lhs = evalCheck(env, lhsNode, [PtlsNumber, PtlsString]);

      if (lhs is PtlsNumber) {
        PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
        return PtlsNumber(lhs.value + rhs.value);
      }

      PtlsString rhs = evalCheck(env, rhsNode, [PtlsString]);
      return PtlsString((lhs as PtlsString).value + rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Sub: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsNumber(lhs.value - rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Mul: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsNumber(lhs.value * rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Div: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      if (rhs.value == 0) {
        var error = PtlsError("Arithmetic Error");
        error.message = "Division by zero";
        error.locs.add(rhs.loc);
        throw error;
      }
      return PtlsNumber(lhs.value / rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Mod: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsNumber(lhs.value % rhs.value);
    }

    // -----------------------------------------------------------------------

    case Tok.Pow: {
      PtlsNumber lhs = evalCheck(env, lhsNode, [PtlsNumber]);
      PtlsNumber rhs = evalCheck(env, rhsNode, [PtlsNumber]);
      return PtlsNumber(pow(lhs.value, rhs.value));
    }

    // -----------------------------------------------------------------------

    default: throw false;
  }
}
