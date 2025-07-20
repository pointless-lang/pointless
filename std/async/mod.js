import { checkType } from "../../src/values.js";
import { List } from "immutable";

export async function sleep(ms) {
  await new Promise((next) => setTimeout(next, ms));
  return null;
}

export async function getFirst(funcs) {
  checkType(funcs, "list");

  const promises = funcs.map((func) => {
    checkType(func, "function");
    return func.call();
  });

  // To Do: add cancellation for losing promises

  return await Promise.race(promises);
}

export async function getAll(funcs) {
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
