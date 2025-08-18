import { checkType } from "../src/values.js";
import im from "immutable";

export const _docs = "Manage concurrent operations.";

// In Pointless, all function calls are implicitly awaited; there are no raw
// promises that can be created and awaited later. Instead, the \`async\` module
// provides a small set of structured tools for running batches of functions
// concurrently.

export async function getFirst(funcs) {
  // Run the zero-argument functions in the list `funcs` concurrently and
  // return the result of the first one that finishes.
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
  // Async.getFirst([getA, getB]) -- Returns "b" after 100 ms
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
  // Run each zero-argument function in the list `funcs` concurrently. Wait
  // until all functions finish running and return a list of their results.
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
  // Async.getAll([getA, getB]) -- Returns ["a", "b"] after 200 ms
  // ```

  checkType(funcs, "list");

  const promises = funcs.map((func) => {
    checkType(func, "function");
    return func.call();
  });

  return im.List(await Promise.all(promises));
}

export async function sleep(ms) {
  // Pause the current execution branch for `ms` milliseconds.
  //
  // ```ptls --no-eval
  // sleep(1000) -- Pause for 1 second
  // ```

  await new Promise((next) => setTimeout(next, ms));
  return null;
}

export async function $yield() {
  // Pause a loop temporarily to allow other concurrently running functions
  // to progress.
  //
  // ```ptls --no-eval
  // Async.yield() -- Pause to allow other functions to run
  // ```

  await new Promise((next) => setTimeout(next, 0));
  return null;
}

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
