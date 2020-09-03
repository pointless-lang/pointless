
import "ptlsError.dart";
import "ptlsValue.dart";

// ---------------------------------------------------------------------------

class Thunk {
  String name;
  Function func;
  PtlsValue value;
  int index;
  var lock = false;

  // -------------------------------------------------------------------------

  Thunk(this.name, this.func);

  // -------------------------------------------------------------------------

  static Thunk fromValue(String name, PtlsValue val) {
    var thunk = Thunk(name, null);
    thunk.value = val;
    return thunk;
  }

  // -------------------------------------------------------------------------

  PtlsValue getValue() {
    if (value == null) {
      checkLock();
      lock = true;
      try {
        value = func();

      } catch(err) {
        rethrow;

      } finally {
        // reset lock even in event of failure
        // allows def to be re-evaulated when used in REPL
        lock = false;
      }

    }
    return value;
  }

  // -------------------------------------------------------------------------

  void checkLock() {
    if (lock) {
      var error = PtlsError("Name Error");
      error.message = "Circular definition for name '$name'";
      throw error;
    }
  }

  // -------------------------------------------------------------------------

  String toString() => value?.toString() ?? "?";
}
