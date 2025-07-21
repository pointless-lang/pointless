import { checkType } from "../../src/values.js";
import { List } from "immutable";

export async function sleep(ms) {
  // Pause the current execution branch for `ms` milliseconds
  //
  // ```ptls
  // sleep(1000) -- Pause for 1 second
  // ```

  await new Promise((next) => setTimeout(next, ms));
  return null;
}

export async function getFirst(funcs) {
  // Given a list of zero-argument functions `funcs`, run each function
  // concurrently until one of the functions finishes. Return the value
  // from this function.
  //
  // *Note: the functions that are still running when the first function
  // finishes should be stopped; however, limitations of JS currently
  // prevent this.*
  //
  // ```ptls --no-eval
  // fn getA()
  //   sleep(200)
  //   "a"
  // end
  //
  // fn getB()
  //   sleep(100)
  //   "b"
  // end
  //
  // async.getFirst([getA, getB]) -- Returns "b" after 100 ms
  // ```

  checkType(funcs, "list");

  const promises = funcs.map((func) => {
    checkType(func, "function");
    return func.call();
  });

  // To Do: add cancellation for losing promises

  return await Promise.race(promises);
}

export async function getAll(funcs) {
  // Given a list of zero-argument functions `funcs`, run each function
  // concurrently until all of the functions finish. Return the returned
  // values from these functions as a list.
  //
  // ```ptls --no-eval
  // fn getA()
  //   sleep(200)
  //   "a"
  // end
  //
  // fn getB()
  //   sleep(100)
  //   "b"
  // end
  //
  // async.getAll([getA, getB]) -- Returns ["a", b"] after 200 ms
  // ```

  checkType(funcs, "list");

  const promises = funcs.map((func) => {
    checkType(func, "function");
    return func.call();
  });

  return List(await Promise.all(promises));
}

// export async function $yield() {
//   return sleep(0);
// }

// async function tryCall(func) {
//   try {
//     await func.call();
//   } catch (err) {
//     if (err instanceof Panic) {
//       // use Panic.toString for Panics and Errs
//       console.log(Panic.prototype.toString.call(err));
//     }

//     throw err;
//   }
// }

// export function branch(func) {
//   checkType(func, "function");
//   tryCall(func)
// }

// export function loop(func) {
//   checkType(func, "function");
//   const ref = new Ref(true);

//   (async () => {
//     while (ref.value) {
//       await sleep(0);
//       await tryCall(func);
//     }
//   })();

//   return ref;
// }

// export function cancel(ref) {
//   checkType(ref, "ref");
//   ref.value = false;
//   return null;
// }
