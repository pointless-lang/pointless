var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
import { createRequire } from "node:module";
var __require = createRequire(import.meta.url);

var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/num.js
function checkPositive(n) {
  checkType(n, "number");
  if (Number.isNaN(n) || n < 0) {
    throw new Panic("expected a positive number");
  }
  return n;
}
function checkWhole(n) {
  checkType(n, "number");
  if (!Number.isInteger(n)) {
    throw new Panic("expected a whole number");
  }
  return n;
}
function checkNumResult(result, ...args) {
  if (args.some((arg) => !Number.isFinite(arg))) {
    return result;
  }
  switch (result) {
    case Infinity:
    case -Infinity:
      throw new Panic("result out of range");
  }
  if (Number.isNaN(result)) {
    throw new Panic("invalid arguments");
  }
  return result;
}
var init_num = __esm({
  "src/num.js"() {
    init_panic();
    init_values();
  }
});

// immutable/immutable.js
function isIndexed(maybeIndexed) {
  return Boolean(maybeIndexed && // @ts-expect-error: maybeIndexed is typed as `{}`, need to change in 6.0 to `maybeIndexed && typeof maybeIndexed === 'object' && IS_INDEXED_SYMBOL in maybeIndexed`
  maybeIndexed[IS_INDEXED_SYMBOL]);
}
function isKeyed(maybeKeyed) {
  return Boolean(maybeKeyed && // @ts-expect-error: maybeKeyed is typed as `{}`, need to change in 6.0 to `maybeKeyed && typeof maybeKeyed === 'object' && IS_KEYED_SYMBOL in maybeKeyed`
  maybeKeyed[IS_KEYED_SYMBOL]);
}
function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}
function isCollection(maybeCollection) {
  return Boolean(maybeCollection && // @ts-expect-error: maybeCollection is typed as `{}`, need to change in 6.0 to `maybeCollection && typeof maybeCollection === 'object' && IS_COLLECTION_SYMBOL in maybeCollection`
  maybeCollection[IS_COLLECTION_SYMBOL]);
}
function iteratorValue(type, k, v, iteratorResult) {
  var value = type === ITERATE_KEYS ? k : type === ITERATE_VALUES ? v : [
    k,
    v
  ];
  iteratorResult ? iteratorResult.value = value : iteratorResult = {
    // @ts-expect-error ensure value is not undefined
    value,
    done: false
  };
  return iteratorResult;
}
function iteratorDone() {
  return {
    value: void 0,
    done: true
  };
}
function hasIterator(maybeIterable) {
  if (Array.isArray(maybeIterable)) {
    return true;
  }
  return !!getIteratorFn(maybeIterable);
}
function isIterator(maybeIterator) {
  return !!(maybeIterator && // @ts-expect-error: maybeIterator is typed as `{}`
  typeof maybeIterator.next === "function");
}
function getIterator(iterable) {
  var iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}
function getIteratorFn(iterable) {
  var iteratorFn = iterable && // @ts-expect-error: maybeIterator is typed as `{}`
  (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL] || // @ts-expect-error: maybeIterator is typed as `{}`
  iterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === "function") {
    return iteratorFn;
  }
}
function isEntriesIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.entries;
}
function isKeysIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.keys;
}
function MakeRef() {
  return {
    value: false
  };
}
function SetRef(ref) {
  if (ref) {
    ref.value = true;
  }
}
function OwnerID() {
}
function ensureSize(iter) {
  if (iter.size === void 0) {
    iter.size = iter.__iterate(returnTrue);
  }
  return iter.size;
}
function wrapIndex(iter, index) {
  if (typeof index !== "number") {
    var uint32Index = index >>> 0;
    if ("" + uint32Index !== index || uint32Index === 4294967295) {
      return NaN;
    }
    index = uint32Index;
  }
  return index < 0 ? ensureSize(iter) + index : index;
}
function returnTrue() {
  return true;
}
function wholeSlice(begin, end, size) {
  return (begin === 0 && !isNeg(begin) || size !== void 0 && begin <= -size) && (end === void 0 || size !== void 0 && end >= size);
}
function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}
function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}
function resolveIndex(index, size, defaultIndex) {
  return index === void 0 ? defaultIndex : isNeg(index) ? size === Infinity ? size : Math.max(0, size + index) | 0 : size === void 0 || size === index ? index : Math.min(size, index) | 0;
}
function isNeg(value) {
  return value < 0 || value === 0 && 1 / value === -Infinity;
}
function isRecord(maybeRecord) {
  return Boolean(maybeRecord && // @ts-expect-error: maybeRecord is typed as `{}`, need to change in 6.0 to `maybeRecord && typeof maybeRecord === 'object' && IS_RECORD_SYMBOL in maybeRecord`
  maybeRecord[IS_RECORD_SYMBOL]);
}
function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}
function isOrdered(maybeOrdered) {
  return Boolean(maybeOrdered && // @ts-expect-error: maybeOrdered is typed as `{}`, need to change in 6.0 to `maybeOrdered && typeof maybeOrdered === 'object' && IS_ORDERED_SYMBOL in maybeOrdered`
  maybeOrdered[IS_ORDERED_SYMBOL]);
}
function isSeq(maybeSeq) {
  return Boolean(maybeSeq && // @ts-expect-error: maybeSeq is typed as `{}`, need to change in 6.0 to `maybeSeq && typeof maybeSeq === 'object' && MAYBE_SEQ_SYMBOL in maybeSeq`
  maybeSeq[IS_SEQ_SYMBOL]);
}
function isArrayLike(value) {
  if (Array.isArray(value) || typeof value === "string") {
    return true;
  }
  return value && typeof value === "object" && // @ts-expect-error check that `'length' in value &&`
  Number.isInteger(value.length) && // @ts-expect-error check that `'length' in value &&`
  value.length >= 0 && // @ts-expect-error check that `'length' in value &&`
  (value.length === 0 ? Object.keys(value).length === 1 : value.hasOwnProperty(value.length - 1));
}
function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
}
function keyedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === "object") {
    return new ObjectSeq(value);
  }
  throw new TypeError("Expected Array or collection object of [k, v] entries, or keyed object: " + value);
}
function indexedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError("Expected Array or collection object of values: " + value);
}
function seqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value) ? seq.fromEntrySeq() : isKeysIterable(value) ? seq.toSetSeq() : seq;
  }
  if (typeof value === "object") {
    return new ObjectSeq(value);
  }
  throw new TypeError("Expected Array or collection object of values, or keyed object: " + value);
}
function maybeIndexedSeqFromValue(value) {
  return isArrayLike(value) ? new ArraySeq(value) : hasIterator(value) ? new CollectionSeq(value) : void 0;
}
function asImmutable() {
  return this.__ensureOwner();
}
function asMutable() {
  return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
}
function smi(i32) {
  return i32 >>> 1 & 1073741824 | i32 & 3221225471;
}
function hash(o) {
  if (o == null) {
    return hashNullish(o);
  }
  if (typeof o.hashCode === "function") {
    return smi(o.hashCode(o));
  }
  var v = valueOf(o);
  if (v == null) {
    return hashNullish(v);
  }
  switch (typeof v) {
    case "boolean":
      return v ? 1108378657 : 1108378656;
    case "number":
      return hashNumber(v);
    case "string":
      return v.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(v) : hashString(v);
    case "object":
    case "function":
      return hashJSObj(v);
    case "symbol":
      return hashSymbol(v);
    default:
      if (typeof v.toString === "function") {
        return hashString(v.toString());
      }
      throw new Error("Value type " + typeof v + " cannot be hashed.");
  }
}
function hashNullish(nullish) {
  return nullish === null ? 1108378658 : (
    /* undefined */
    1108378659
  );
}
function hashNumber(n) {
  if (n !== n || n === Infinity) {
    return 0;
  }
  var hash2 = n | 0;
  if (hash2 !== n) {
    hash2 ^= n * 4294967295;
  }
  while (n > 4294967295) {
    n /= 4294967295;
    hash2 ^= n;
  }
  return smi(hash2);
}
function cachedHashString(string) {
  var hashed = stringHashCache[string];
  if (hashed === void 0) {
    hashed = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hashed;
  }
  return hashed;
}
function hashString(string) {
  var hashed = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hashed = 31 * hashed + string.charCodeAt(ii) | 0;
  }
  return smi(hashed);
}
function hashSymbol(sym) {
  var hashed = symbolMap[sym];
  if (hashed !== void 0) {
    return hashed;
  }
  hashed = nextHash();
  symbolMap[sym] = hashed;
  return hashed;
}
function hashJSObj(obj) {
  var hashed;
  if (usingWeakMap) {
    hashed = weakMap.get(obj);
    if (hashed !== void 0) {
      return hashed;
    }
  }
  hashed = obj[UID_HASH_KEY];
  if (hashed !== void 0) {
    return hashed;
  }
  if (!canDefineProperty) {
    hashed = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
    if (hashed !== void 0) {
      return hashed;
    }
    hashed = getIENodeHash(obj);
    if (hashed !== void 0) {
      return hashed;
    }
  }
  hashed = nextHash();
  if (usingWeakMap) {
    weakMap.set(obj, hashed);
  } else if (isExtensible !== void 0 && isExtensible(obj) === false) {
    throw new Error("Non-extensible objects are not allowed as keys.");
  } else if (canDefineProperty) {
    Object.defineProperty(obj, UID_HASH_KEY, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashed
    });
  } else if (obj.propertyIsEnumerable !== void 0 && obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
    obj.propertyIsEnumerable = function() {
      return this.constructor.prototype.propertyIsEnumerable.apply(
        this,
        // eslint-disable-next-line prefer-rest-params
        arguments
      );
    };
    obj.propertyIsEnumerable[UID_HASH_KEY] = hashed;
  } else if (obj.nodeType !== void 0) {
    obj[UID_HASH_KEY] = hashed;
  } else {
    throw new Error("Unable to set a non-enumerable property on object.");
  }
  return hashed;
}
function getIENodeHash(node) {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1:
        return node.uniqueID;
      case 9:
        return node.documentElement && node.documentElement.uniqueID;
    }
  }
}
function valueOf(obj) {
  return obj.valueOf !== defaultValueOf && typeof obj.valueOf === "function" ? obj.valueOf(obj) : obj;
}
function nextHash() {
  var nextHash2 = ++_objHashUID;
  if (_objHashUID & 1073741824) {
    _objHashUID = 0;
  }
  return nextHash2;
}
function flipFactory(collection) {
  var flipSequence = makeSequence(collection);
  flipSequence._iter = collection;
  flipSequence.size = collection.size;
  flipSequence.flip = function() {
    return collection;
  };
  flipSequence.reverse = function() {
    var reversedSequence = collection.reverse.apply(this);
    reversedSequence.flip = function() {
      return collection.reverse();
    };
    return reversedSequence;
  };
  flipSequence.has = function(key) {
    return collection.includes(key);
  };
  flipSequence.includes = function(key) {
    return collection.has(key);
  };
  flipSequence.cacheResult = cacheResultThrough;
  flipSequence.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    return collection.__iterate(function(v, k) {
      return fn(k, v, this$1$1) !== false;
    }, reverse6);
  };
  flipSequence.__iteratorUncached = function(type, reverse6) {
    if (type === ITERATE_ENTRIES) {
      var iterator = collection.__iterator(type, reverse6);
      return new Iterator(function() {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      });
    }
    return collection.__iterator(type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES, reverse6);
  };
  return flipSequence;
}
function mapFactory(collection, mapper, context) {
  var mappedSequence = makeSequence(collection);
  mappedSequence.size = collection.size;
  mappedSequence.has = function(key) {
    return collection.has(key);
  };
  mappedSequence.get = function(key, notSetValue) {
    var v = collection.get(key, NOT_SET);
    return v === NOT_SET ? notSetValue : mapper.call(context, v, key, collection);
  };
  mappedSequence.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    return collection.__iterate(function(v, k, c) {
      return fn(mapper.call(context, v, k, c), k, this$1$1) !== false;
    }, reverse6);
  };
  mappedSequence.__iteratorUncached = function(type, reverse6) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse6);
    return new Iterator(function() {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(type, key, mapper.call(context, entry[1], key, collection), step);
    });
  };
  return mappedSequence;
}
function reverseFactory(collection, useKeys) {
  var this$1$1 = this;
  var reversedSequence = makeSequence(collection);
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  reversedSequence.reverse = function() {
    return collection;
  };
  if (collection.flip) {
    reversedSequence.flip = function() {
      var flipSequence = flipFactory(collection);
      flipSequence.reverse = function() {
        return collection.flip();
      };
      return flipSequence;
    };
  }
  reversedSequence.get = function(key, notSetValue) {
    return collection.get(useKeys ? key : -1 - key, notSetValue);
  };
  reversedSequence.has = function(key) {
    return collection.has(useKeys ? key : -1 - key);
  };
  reversedSequence.includes = function(value) {
    return collection.includes(value);
  };
  reversedSequence.cacheResult = cacheResultThrough;
  reversedSequence.__iterate = function(fn, reverse6) {
    var this$1$12 = this;
    var i = 0;
    reverse6 && ensureSize(collection);
    return collection.__iterate(function(v, k) {
      return fn(v, useKeys ? k : reverse6 ? this$1$12.size - ++i : i++, this$1$12);
    }, !reverse6);
  };
  reversedSequence.__iterator = function(type, reverse6) {
    var i = 0;
    reverse6 && ensureSize(collection);
    var iterator = collection.__iterator(ITERATE_ENTRIES, !reverse6);
    return new Iterator(function() {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      return iteratorValue(type, useKeys ? entry[0] : reverse6 ? this$1$1.size - ++i : i++, entry[1], step);
    });
  };
  return reversedSequence;
}
function filterFactory(collection, predicate, context, useKeys) {
  var filterSequence = makeSequence(collection);
  if (useKeys) {
    filterSequence.has = function(key) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, collection);
    };
    filterSequence.get = function(key, notSetValue) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, collection) ? v : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    var iterations = 0;
    collection.__iterate(function(v, k, c) {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    }, reverse6);
    return iterations;
  };
  filterSequence.__iteratorUncached = function(type, reverse6) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse6);
    var iterations = 0;
    return new Iterator(function() {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, collection)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  };
  return filterSequence;
}
function countByFactory(collection, grouper, context) {
  var groups = Map2().asMutable();
  collection.__iterate(function(v, k) {
    groups.update(grouper.call(context, v, k, collection), 0, function(a) {
      return a + 1;
    });
  });
  return groups.asImmutable();
}
function groupByFactory(collection, grouper, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = (isOrdered(collection) ? OrderedMap() : Map2()).asMutable();
  collection.__iterate(function(v, k) {
    groups.update(grouper.call(context, v, k, collection), function(a) {
      return a = a || [], a.push(isKeyedIter ? [
        k,
        v
      ] : v), a;
    });
  });
  var coerce = collectionClass(collection);
  return groups.map(function(arr) {
    return reify(collection, coerce(arr));
  }).asImmutable();
}
function partitionFactory(collection, predicate, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = [
    [],
    []
  ];
  collection.__iterate(function(v, k) {
    groups[predicate.call(context, v, k, collection) ? 1 : 0].push(isKeyedIter ? [
      k,
      v
    ] : v);
  });
  var coerce = collectionClass(collection);
  return groups.map(function(arr) {
    return reify(collection, coerce(arr));
  });
}
function sliceFactory(collection, begin, end, useKeys) {
  var originalSize = collection.size;
  if (wholeSlice(begin, end, originalSize)) {
    return collection;
  }
  if (typeof originalSize === "undefined" && (begin < 0 || end < 0)) {
    return sliceFactory(collection.toSeq().cacheResult(), begin, end, useKeys);
  }
  var resolvedBegin = resolveBegin(begin, originalSize);
  var resolvedEnd = resolveEnd(end, originalSize);
  var resolvedSize = resolvedEnd - resolvedBegin;
  var sliceSize;
  if (resolvedSize === resolvedSize) {
    sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
  }
  var sliceSeq = makeSequence(collection);
  sliceSeq.size = sliceSize === 0 ? sliceSize : collection.size && sliceSize || void 0;
  if (!useKeys && isSeq(collection) && sliceSize >= 0) {
    sliceSeq.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      return index >= 0 && index < sliceSize ? collection.get(index + resolvedBegin, notSetValue) : notSetValue;
    };
  }
  sliceSeq.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    if (sliceSize === 0) {
      return 0;
    }
    if (reverse6) {
      return this.cacheResult().__iterate(fn, reverse6);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function(v, k) {
      if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1) !== false && iterations !== sliceSize;
      }
    });
    return iterations;
  };
  sliceSeq.__iteratorUncached = function(type, reverse6) {
    if (sliceSize !== 0 && reverse6) {
      return this.cacheResult().__iterator(type, reverse6);
    }
    if (sliceSize === 0) {
      return new Iterator(iteratorDone);
    }
    var iterator = collection.__iterator(type, reverse6);
    var skipped = 0;
    var iterations = 0;
    return new Iterator(function() {
      while (skipped++ < resolvedBegin) {
        iterator.next();
      }
      if (++iterations > sliceSize) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES || step.done) {
        return step;
      }
      if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations - 1, void 0, step);
      }
      return iteratorValue(type, iterations - 1, step.value[1], step);
    });
  };
  return sliceSeq;
}
function takeWhileFactory(collection, predicate, context) {
  var takeSequence = makeSequence(collection);
  takeSequence.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    if (reverse6) {
      return this.cacheResult().__iterate(fn, reverse6);
    }
    var iterations = 0;
    collection.__iterate(function(v, k, c) {
      return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$1$1);
    });
    return iterations;
  };
  takeSequence.__iteratorUncached = function(type, reverse6) {
    var this$1$1 = this;
    if (reverse6) {
      return this.cacheResult().__iterator(type, reverse6);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse6);
    var iterating = true;
    return new Iterator(function() {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, this$1$1)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return takeSequence;
}
function skipWhileFactory(collection, predicate, context, useKeys) {
  var skipSequence = makeSequence(collection);
  skipSequence.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    if (reverse6) {
      return this.cacheResult().__iterate(fn, reverse6);
    }
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function(v, k, c) {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function(type, reverse6) {
    var this$1$1 = this;
    if (reverse6) {
      return this.cacheResult().__iterator(type, reverse6);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse6);
    var skipping = true;
    var iterations = 0;
    return new Iterator(function() {
      var step;
      var k;
      var v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          }
          if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, void 0, step);
          }
          return iteratorValue(type, iterations++, step.value[1], step);
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, this$1$1));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return skipSequence;
}
function concatFactory(collection, values3) {
  var isKeyedCollection = isKeyed(collection);
  var iters = [
    collection
  ].concat(values3).map(function(v) {
    if (!isCollection(v)) {
      v = isKeyedCollection ? keyedSeqFromValue(v) : indexedSeqFromValue(Array.isArray(v) ? v : [
        v
      ]);
    } else if (isKeyedCollection) {
      v = KeyedCollection(v);
    }
    return v;
  }).filter(function(v) {
    return v.size !== 0;
  });
  if (iters.length === 0) {
    return collection;
  }
  if (iters.length === 1) {
    var singleton = iters[0];
    if (singleton === collection || isKeyedCollection && isKeyed(singleton) || isIndexed(collection) && isIndexed(singleton)) {
      return singleton;
    }
  }
  return new ConcatSeq(iters);
}
function flattenFactory(collection, depth, useKeys) {
  var flatSequence = makeSequence(collection);
  flatSequence.__iterateUncached = function(fn, reverse6) {
    if (reverse6) {
      return this.cacheResult().__iterate(fn, reverse6);
    }
    var iterations = 0;
    var stopped = false;
    function flatDeep(iter, currentDepth) {
      iter.__iterate(function(v, k) {
        if ((!depth || currentDepth < depth) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse6);
    }
    flatDeep(collection, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function(type, reverse6) {
    if (reverse6) {
      return this.cacheResult().__iterator(type, reverse6);
    }
    var iterator = collection.__iterator(type, reverse6);
    var stack = [];
    var iterations = 0;
    return new Iterator(function() {
      while (iterator) {
        var step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        var v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse6);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  return flatSequence;
}
function flatMapFactory(collection, mapper, context) {
  var coerce = collectionClass(collection);
  return collection.toSeq().map(function(v, k) {
    return coerce(mapper.call(context, v, k, collection));
  }).flatten(true);
}
function interposeFactory(collection, separator) {
  var interposedSequence = makeSequence(collection);
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function(fn, reverse6) {
    var this$1$1 = this;
    var iterations = 0;
    collection.__iterate(function(v) {
      return (!iterations || fn(separator, iterations++, this$1$1) !== false) && fn(v, iterations++, this$1$1) !== false;
    }, reverse6);
    return iterations;
  };
  interposedSequence.__iteratorUncached = function(type, reverse6) {
    var iterator = collection.__iterator(ITERATE_VALUES, reverse6);
    var iterations = 0;
    var step;
    return new Iterator(function() {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2 ? iteratorValue(type, iterations++, separator) : iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
}
function sortFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  var isKeyedCollection = isKeyed(collection);
  var index = 0;
  var entries3 = collection.toSeq().map(function(v, k) {
    return [
      k,
      v,
      index++,
      mapper ? mapper(v, k, collection) : v
    ];
  }).valueSeq().toArray();
  entries3.sort(function(a, b) {
    return comparator(a[3], b[3]) || a[2] - b[2];
  }).forEach(isKeyedCollection ? function(v, i) {
    entries3[i].length = 2;
  } : function(v, i) {
    entries3[i] = v[1];
  });
  return isKeyedCollection ? KeyedSeq(entries3) : isIndexed(collection) ? IndexedSeq(entries3) : SetSeq(entries3);
}
function maxFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  if (mapper) {
    var entry = collection.toSeq().map(function(v, k) {
      return [
        v,
        mapper(v, k, collection)
      ];
    }).reduce(function(a, b) {
      return maxCompare(comparator, a[1], b[1]) ? b : a;
    });
    return entry && entry[0];
  }
  return collection.reduce(function(a, b) {
    return maxCompare(comparator, a, b) ? b : a;
  });
}
function maxCompare(comparator, a, b) {
  var comp = comparator(b, a);
  return comp === 0 && b !== a && (b === void 0 || b === null || b !== b) || comp > 0;
}
function zipWithFactory(keyIter, zipper, iters, zipAll2) {
  var zipSequence = makeSequence(keyIter);
  var sizes = new ArraySeq(iters).map(function(i) {
    return i.size;
  });
  zipSequence.size = zipAll2 ? sizes.max() : sizes.min();
  zipSequence.__iterate = function(fn, reverse6) {
    var iterator = this.__iterator(ITERATE_VALUES, reverse6);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function(type, reverse6) {
    var iterators = iters.map(function(i) {
      return i = Collection(i), getIterator(reverse6 ? i.reverse() : i);
    });
    var iterations = 0;
    var isDone = false;
    return new Iterator(function() {
      var steps;
      if (!isDone) {
        steps = iterators.map(function(i) {
          return i.next();
        });
        isDone = zipAll2 ? steps.every(function(s) {
          return s.done;
        }) : steps.some(function(s) {
          return s.done;
        });
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(type, iterations++, zipper.apply(null, steps.map(function(s) {
        return s.value;
      })));
    });
  };
  return zipSequence;
}
function reify(iter, seq) {
  return iter === seq ? iter : isSeq(iter) ? seq : iter.constructor(seq);
}
function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError("Expected [K, V] tuple: " + entry);
  }
}
function collectionClass(collection) {
  return isKeyed(collection) ? KeyedCollection : isIndexed(collection) ? IndexedCollection : SetCollection;
}
function makeSequence(collection) {
  return Object.create((isKeyed(collection) ? KeyedSeq : isIndexed(collection) ? IndexedSeq : SetSeq).prototype);
}
function cacheResultThrough() {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;
    return this;
  }
  return Seq.prototype.cacheResult.call(this);
}
function defaultComparator(a, b) {
  if (a === void 0 && b === void 0) {
    return 0;
  }
  if (a === void 0) {
    return 1;
  }
  if (b === void 0) {
    return -1;
  }
  return a > b ? 1 : a < b ? -1 : 0;
}
function isValueObject(maybeValue) {
  return Boolean(maybeValue && // @ts-expect-error: maybeValue is typed as `{}`
  typeof maybeValue.equals === "function" && // @ts-expect-error: maybeValue is typed as `{}`
  typeof maybeValue.hashCode === "function");
}
function is(valueA, valueB) {
  if (valueA === valueB || valueA !== valueA && valueB !== valueB) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (typeof valueA.valueOf === "function" && typeof valueB.valueOf === "function") {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || valueA !== valueA && valueB !== valueB) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }
  return !!(isValueObject(valueA) && isValueObject(valueB) && valueA.equals(valueB));
}
function update$1(collection, key, notSetValue, updater) {
  return updateIn(
    // @ts-expect-error Index signature for type string is missing in type V[]
    collection,
    [
      key
    ],
    notSetValue,
    updater
  );
}
function merge$1() {
  var iters = [], len6 = arguments.length;
  while (len6--) iters[len6] = arguments[len6];
  return mergeIntoKeyedWith(this, iters);
}
function mergeWith$1(merger) {
  var iters = [], len6 = arguments.length - 1;
  while (len6-- > 0) iters[len6] = arguments[len6 + 1];
  if (typeof merger !== "function") {
    throw new TypeError("Invalid merger function: " + merger);
  }
  return mergeIntoKeyedWith(this, iters, merger);
}
function mergeIntoKeyedWith(collection, collections, merger) {
  var iters = [];
  for (var ii = 0; ii < collections.length; ii++) {
    var collection$1 = KeyedCollection(collections[ii]);
    if (collection$1.size !== 0) {
      iters.push(collection$1);
    }
  }
  if (iters.length === 0) {
    return collection;
  }
  if (collection.toSeq().size === 0 && !collection.__ownerID && iters.length === 1) {
    return isRecord(collection) ? collection : collection.constructor(iters[0]);
  }
  return collection.withMutations(function(collection2) {
    var mergeIntoCollection = merger ? function(value, key) {
      update$1(collection2, key, NOT_SET, function(oldVal) {
        return oldVal === NOT_SET ? value : merger(oldVal, value, key);
      });
    } : function(value, key) {
      collection2.set(key, value);
    };
    for (var ii2 = 0; ii2 < iters.length; ii2++) {
      iters[ii2].forEach(mergeIntoCollection);
    }
  });
}
function isPlainObject(value) {
  if (!value || typeof value !== "object" || toString2.call(value) !== "[object Object]") {
    return false;
  }
  var proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  var parentProto = proto;
  var nextProto = Object.getPrototypeOf(proto);
  while (nextProto !== null) {
    parentProto = nextProto;
    nextProto = Object.getPrototypeOf(parentProto);
  }
  return parentProto === proto;
}
function isDataStructure(value) {
  return typeof value === "object" && (isImmutable(value) || Array.isArray(value) || isPlainObject(value));
}
function arrCopy(arr, offset) {
  offset = offset || 0;
  var len6 = Math.max(0, arr.length - offset);
  var newArr = new Array(len6);
  for (var ii = 0; ii < len6; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  var to = {};
  for (var key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}
function merge(collection) {
  var sources = [], len6 = arguments.length - 1;
  while (len6-- > 0) sources[len6] = arguments[len6 + 1];
  return mergeWithSources(collection, sources);
}
function mergeWith(merger, collection) {
  var sources = [], len6 = arguments.length - 2;
  while (len6-- > 0) sources[len6] = arguments[len6 + 2];
  return mergeWithSources(collection, sources, merger);
}
function mergeDeep$1(collection) {
  var sources = [], len6 = arguments.length - 1;
  while (len6-- > 0) sources[len6] = arguments[len6 + 1];
  return mergeDeepWithSources(collection, sources);
}
function mergeDeepWith$1(merger, collection) {
  var sources = [], len6 = arguments.length - 2;
  while (len6-- > 0) sources[len6] = arguments[len6 + 2];
  return mergeDeepWithSources(collection, sources, merger);
}
function mergeDeepWithSources(collection, sources, merger) {
  return mergeWithSources(collection, sources, deepMergerWith(merger));
}
function mergeWithSources(collection, sources, merger) {
  if (!isDataStructure(collection)) {
    throw new TypeError("Cannot merge into non-data-structure value: " + collection);
  }
  if (isImmutable(collection)) {
    return typeof merger === "function" && collection.mergeWith ? collection.mergeWith.apply(collection, [
      merger
    ].concat(sources)) : collection.merge ? collection.merge.apply(collection, sources) : collection.concat.apply(collection, sources);
  }
  var isArray = Array.isArray(collection);
  var merged = collection;
  var Collection3 = isArray ? IndexedCollection : KeyedCollection;
  var mergeItem = isArray ? function(value) {
    if (merged === collection) {
      merged = shallowCopy(merged);
    }
    merged.push(value);
  } : function(value, key) {
    var hasVal = hasOwnProperty.call(merged, key);
    var nextVal = hasVal && merger ? merger(merged[key], value, key) : value;
    if (!hasVal || nextVal !== merged[key]) {
      if (merged === collection) {
        merged = shallowCopy(merged);
      }
      merged[key] = nextVal;
    }
  };
  for (var i = 0; i < sources.length; i++) {
    Collection3(sources[i]).forEach(mergeItem);
  }
  return merged;
}
function deepMergerWith(merger) {
  function deepMerger(oldValue, newValue, key) {
    return isDataStructure(oldValue) && isDataStructure(newValue) && areMergeable(oldValue, newValue) ? mergeWithSources(oldValue, [
      newValue
    ], deepMerger) : merger ? merger(oldValue, newValue, key) : newValue;
  }
  return deepMerger;
}
function areMergeable(oldDataStructure, newDataStructure) {
  var oldSeq = Seq(oldDataStructure);
  var newSeq = Seq(newDataStructure);
  return isIndexed(oldSeq) === isIndexed(newSeq) && isKeyed(oldSeq) === isKeyed(newSeq);
}
function mergeDeep() {
  var iters = [], len6 = arguments.length;
  while (len6--) iters[len6] = arguments[len6];
  return mergeDeepWithSources(this, iters);
}
function mergeDeepWith(merger) {
  var iters = [], len6 = arguments.length - 1;
  while (len6-- > 0) iters[len6] = arguments[len6 + 1];
  return mergeDeepWithSources(this, iters, merger);
}
function mergeDeepIn(keyPath) {
  var iters = [], len6 = arguments.length - 1;
  while (len6-- > 0) iters[len6] = arguments[len6 + 1];
  return updateIn(this, keyPath, emptyMap(), function(m) {
    return mergeDeepWithSources(m, iters);
  });
}
function mergeIn(keyPath) {
  var iters = [], len6 = arguments.length - 1;
  while (len6-- > 0) iters[len6] = arguments[len6 + 1];
  return updateIn(this, keyPath, emptyMap(), function(m) {
    return mergeWithSources(m, iters);
  });
}
function setIn$1(collection, keyPath, value) {
  return updateIn(collection, keyPath, NOT_SET, function() {
    return value;
  });
}
function setIn(keyPath, v) {
  return setIn$1(this, keyPath, v);
}
function update(key, notSetValue, updater) {
  return arguments.length === 1 ? key(this) : update$1(this, key, notSetValue, updater);
}
function updateIn$1(keyPath, notSetValue, updater) {
  return updateIn(this, keyPath, notSetValue, updater);
}
function wasAltered() {
  return this.__altered;
}
function withMutations(fn) {
  var mutable = this.asMutable();
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
}
function isMap(maybeMap) {
  return Boolean(maybeMap && // @ts-expect-error: maybeMap is typed as `{}`, need to change in 6.0 to `maybeMap && typeof maybeMap === 'object' && IS_MAP_SYMBOL in maybeMap`
  maybeMap[IS_MAP_SYMBOL]);
}
function invariant(condition, error2) {
  if (!condition) {
    throw new Error(error2);
  }
}
function assertNotInfinite(size) {
  invariant(size !== Infinity, "Cannot perform this action with an infinite size.");
}
function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}
function mapIteratorFrame(node, prev) {
  return {
    node,
    index: 0,
    __prev: prev
  };
}
function makeMap(size, root, ownerID, hash2) {
  var map4 = Object.create(MapPrototype);
  map4.size = size;
  map4._root = root;
  map4.__ownerID = ownerID;
  map4.__hash = hash2;
  map4.__altered = false;
  return map4;
}
function emptyMap() {
  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
}
function updateMap(map4, k, v) {
  var newRoot;
  var newSize;
  if (!map4._root) {
    if (v === NOT_SET) {
      return map4;
    }
    newSize = 1;
    newRoot = new ArrayMapNode(map4.__ownerID, [
      [
        k,
        v
      ]
    ]);
  } else {
    var didChangeSize = MakeRef();
    var didAlter = MakeRef();
    newRoot = updateNode(map4._root, map4.__ownerID, 0, void 0, k, v, didChangeSize, didAlter);
    if (!didAlter.value) {
      return map4;
    }
    newSize = map4.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
  }
  if (map4.__ownerID) {
    map4.size = newSize;
    map4._root = newRoot;
    map4.__hash = void 0;
    map4.__altered = true;
    return map4;
  }
  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
}
function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return new ValueNode(ownerID, keyHash, [
      key,
      value
    ]);
  }
  return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
}
function isLeafNode(node) {
  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
}
function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
  if (node.keyHash === keyHash) {
    return new HashCollisionNode(ownerID, keyHash, [
      node.entry,
      entry
    ]);
  }
  var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
  var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var newNode;
  var nodes = idx1 === idx2 ? [
    mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)
  ] : (newNode = new ValueNode(ownerID, keyHash, entry), idx1 < idx2 ? [
    node,
    newNode
  ] : [
    newNode,
    node
  ]);
  return new BitmapIndexedNode(ownerID, 1 << idx1 | 1 << idx2, nodes);
}
function createNodes(ownerID, entries3, key, value) {
  if (!ownerID) {
    ownerID = new OwnerID();
  }
  var node = new ValueNode(ownerID, hash(key), [
    key,
    value
  ]);
  for (var ii = 0; ii < entries3.length; ii++) {
    var entry = entries3[ii];
    node = node.update(ownerID, 0, void 0, entry[0], entry[1]);
  }
  return node;
}
function packNodes(ownerID, nodes, count3, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count3);
  for (var ii = 0, bit = 1, len6 = nodes.length; ii < len6; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node !== void 0 && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}
function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count3 = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count3++] : void 0;
  }
  expandedNodes[including] = node;
  return new HashArrayMapNode(ownerID, count3 + 1, expandedNodes);
}
function popCount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function setAt(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}
function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}
function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}
function coerceKeyPath(keyPath) {
  if (isArrayLike(keyPath) && typeof keyPath !== "string") {
    return keyPath;
  }
  if (isOrdered(keyPath)) {
    return keyPath.toArray();
  }
  throw new TypeError("Invalid keyPath: expected Ordered Collection or Array: " + keyPath);
}
function quoteString(value) {
  try {
    return typeof value === "string" ? JSON.stringify(value) : String(value);
  } catch (_ignoreError) {
    return JSON.stringify(value);
  }
}
function has(collection, key) {
  return isImmutable(collection) ? collection.has(key) : isDataStructure(collection) && hasOwnProperty.call(collection, key);
}
function get6(collection, key, notSetValue) {
  return isImmutable(collection) ? collection.get(key, notSetValue) : !has(collection, key) ? notSetValue : typeof collection.get === "function" ? collection.get(key) : collection[key];
}
function remove(collection, key) {
  if (!isDataStructure(collection)) {
    throw new TypeError("Cannot update non-data-structure value: " + collection);
  }
  if (isImmutable(collection)) {
    if (!collection.remove) {
      throw new TypeError("Cannot update immutable value without .remove() method: " + collection);
    }
    return collection.remove(key);
  }
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
}
function set(collection, key, value) {
  if (!isDataStructure(collection)) {
    throw new TypeError("Cannot update non-data-structure value: " + collection);
  }
  if (isImmutable(collection)) {
    if (!collection.set) {
      throw new TypeError("Cannot update immutable value without .set() method: " + collection);
    }
    return collection.set(key, value);
  }
  if (hasOwnProperty.call(collection, key) && value === collection[key]) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  collectionCopy[key] = value;
  return collectionCopy;
}
function updateIn(collection, keyPath, notSetValue, updater) {
  if (!updater) {
    updater = notSetValue;
    notSetValue = void 0;
  }
  var updatedValue = updateInDeeply(
    isImmutable(collection),
    // @ts-expect-error type issues with Record and mixed types
    collection,
    coerceKeyPath(keyPath),
    0,
    notSetValue,
    updater
  );
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
}
function updateInDeeply(inImmutable, existing, keyPath, i, notSetValue, updater) {
  var wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    var existingValue = wasNotSet ? notSetValue : existing;
    var newValue = updater(existingValue);
    return newValue === existingValue ? existing : newValue;
  }
  if (!wasNotSet && !isDataStructure(existing)) {
    throw new TypeError("Cannot update within non-data-structure value in path [" + Array.from(keyPath).slice(0, i).map(quoteString) + "]: " + existing);
  }
  var key = keyPath[i];
  var nextExisting = wasNotSet ? NOT_SET : get6(existing, key, NOT_SET);
  var nextUpdated = updateInDeeply(
    nextExisting === NOT_SET ? inImmutable : isImmutable(nextExisting),
    // @ts-expect-error mixed type
    nextExisting,
    keyPath,
    i + 1,
    notSetValue,
    updater
  );
  return nextUpdated === nextExisting ? existing : nextUpdated === NOT_SET ? remove(existing, key) : set(wasNotSet ? inImmutable ? emptyMap() : {} : existing, key, nextUpdated);
}
function removeIn(collection, keyPath) {
  return updateIn(collection, keyPath, function() {
    return NOT_SET;
  });
}
function deleteIn(keyPath) {
  return removeIn(this, keyPath);
}
function isList(maybeList) {
  return Boolean(maybeList && // @ts-expect-error: maybeList is typed as `{}`, need to change in 6.0 to `maybeList && typeof maybeList === 'object' && IS_LIST_SYMBOL in maybeList`
  maybeList[IS_LIST_SYMBOL]);
}
function iterateList(list2, reverse6) {
  var left = list2._origin;
  var right = list2._capacity;
  var tailPos = getTailOffset(right);
  var tail = list2._tail;
  return iterateNodeOrLeaf(list2._root, list2._level, 0);
  function iterateNodeOrLeaf(node, level, offset) {
    return level === 0 ? iterateLeaf(node, offset) : iterateNode(node, level, offset);
  }
  function iterateLeaf(node, offset) {
    var array = offset === tailPos ? tail && tail.array : node && node.array;
    var from = offset > left ? 0 : left - offset;
    var to = right - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    return function() {
      if (from === to) {
        return DONE;
      }
      var idx = reverse6 ? --to : from++;
      return array && array[idx];
    };
  }
  function iterateNode(node, level, offset) {
    var values3;
    var array = node && node.array;
    var from = offset > left ? 0 : left - offset >> level;
    var to = (right - offset >> level) + 1;
    if (to > SIZE) {
      to = SIZE;
    }
    return function() {
      while (true) {
        if (values3) {
          var value = values3();
          if (value !== DONE) {
            return value;
          }
          values3 = null;
        }
        if (from === to) {
          return DONE;
        }
        var idx = reverse6 ? --to : from++;
        values3 = iterateNodeOrLeaf(array && array[idx], level - SHIFT, offset + (idx << level));
      }
    };
  }
}
function makeList(origin, capacity, level, root, tail, ownerID, hash2) {
  var list2 = Object.create(ListPrototype);
  list2.size = capacity - origin;
  list2._origin = origin;
  list2._capacity = capacity;
  list2._level = level;
  list2._root = root;
  list2._tail = tail;
  list2.__ownerID = ownerID;
  list2.__hash = hash2;
  list2.__altered = false;
  return list2;
}
function emptyList() {
  return makeList(0, 0, SHIFT);
}
function updateList(list2, index, value) {
  index = wrapIndex(list2, index);
  if (index !== index) {
    return list2;
  }
  if (index >= list2.size || index < 0) {
    return list2.withMutations(function(list3) {
      index < 0 ? setListBounds(list3, index).set(0, value) : setListBounds(list3, 0, index + 1).set(index, value);
    });
  }
  index += list2._origin;
  var newTail = list2._tail;
  var newRoot = list2._root;
  var didAlter = MakeRef();
  if (index >= getTailOffset(list2._capacity)) {
    newTail = updateVNode(newTail, list2.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(newRoot, list2.__ownerID, list2._level, index, value, didAlter);
  }
  if (!didAlter.value) {
    return list2;
  }
  if (list2.__ownerID) {
    list2._root = newRoot;
    list2._tail = newTail;
    list2.__hash = void 0;
    list2.__altered = true;
    return list2;
  }
  return makeList(list2._origin, list2._capacity, list2._level, newRoot, newTail);
}
function updateVNode(node, ownerID, level, index, value, didAlter) {
  var idx = index >>> level & MASK;
  var nodeHas = node && idx < node.array.length;
  if (!nodeHas && value === void 0) {
    return node;
  }
  var newNode;
  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }
  if (nodeHas && node.array[idx] === value) {
    return node;
  }
  if (didAlter) {
    SetRef(didAlter);
  }
  newNode = editableVNode(node, ownerID);
  if (value === void 0 && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
}
function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}
function listNodeFor(list2, rawIndex) {
  if (rawIndex >= getTailOffset(list2._capacity)) {
    return list2._tail;
  }
  if (rawIndex < 1 << list2._level + SHIFT) {
    var node = list2._root;
    var level = list2._level;
    while (node && level > 0) {
      node = node.array[rawIndex >>> level & MASK];
      level -= SHIFT;
    }
    return node;
  }
}
function setListBounds(list2, begin, end) {
  if (begin !== void 0) {
    begin |= 0;
  }
  if (end !== void 0) {
    end |= 0;
  }
  var owner = list2.__ownerID || new OwnerID();
  var oldOrigin = list2._origin;
  var oldCapacity = list2._capacity;
  var newOrigin = oldOrigin + begin;
  var newCapacity = end === void 0 ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return list2;
  }
  if (newOrigin >= newCapacity) {
    return list2.clear();
  }
  var newLevel = list2._level;
  var newRoot = list2._root;
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [
      void 0,
      newRoot
    ] : [], owner);
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }
  var oldTailOffset = getTailOffset(oldCapacity);
  var newTailOffset = getTailOffset(newCapacity);
  while (newTailOffset >= 1 << newLevel + SHIFT) {
    newRoot = new VNode(newRoot && newRoot.array.length ? [
      newRoot
    ] : [], owner);
    newLevel += SHIFT;
  }
  var oldTail = list2._tail;
  var newTail = newTailOffset < oldTailOffset ? listNodeFor(list2, newCapacity - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = oldTailOffset >>> level & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[oldTailOffset >>> SHIFT & MASK] = oldTail;
  }
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;
    while (newRoot) {
      var beginIndex = newOrigin >>> newLevel & MASK;
      if (beginIndex !== newTailOffset >>> newLevel & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }
  if (list2.__ownerID) {
    list2.size = newCapacity - newOrigin;
    list2._origin = newOrigin;
    list2._capacity = newCapacity;
    list2._level = newLevel;
    list2._root = newRoot;
    list2._tail = newTail;
    list2.__hash = void 0;
    list2.__altered = true;
    return list2;
  }
  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
}
function getTailOffset(size) {
  return size < SIZE ? 0 : size - 1 >>> SHIFT << SHIFT;
}
function isOrderedMap(maybeOrderedMap) {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}
function makeOrderedMap(map4, list2, ownerID, hash2) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map4 ? map4.size : 0;
  omap._map = map4;
  omap._list = list2;
  omap.__ownerID = ownerID;
  omap.__hash = hash2;
  omap.__altered = false;
  return omap;
}
function emptyOrderedMap() {
  return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
}
function updateOrderedMap(omap, k, v) {
  var map4 = omap._map;
  var list2 = omap._list;
  var i = map4.get(k);
  var has10 = i !== void 0;
  var newMap;
  var newList;
  if (v === NOT_SET) {
    if (!has10) {
      return omap;
    }
    if (list2.size >= SIZE && list2.size >= map4.size * 2) {
      newList = list2.filter(function(entry, idx) {
        return entry !== void 0 && i !== idx;
      });
      newMap = newList.toKeyedSeq().map(function(entry) {
        return entry[0];
      }).flip().toMap();
      if (omap.__ownerID) {
        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
      }
    } else {
      newMap = map4.remove(k);
      newList = i === list2.size - 1 ? list2.pop() : list2.set(i, void 0);
    }
  } else if (has10) {
    if (v === list2.get(i)[1]) {
      return omap;
    }
    newMap = map4;
    newList = list2.set(i, [
      k,
      v
    ]);
  } else {
    newMap = map4.set(k, list2.size);
    newList = list2.set(list2.size, [
      k,
      v
    ]);
  }
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = void 0;
    omap.__altered = true;
    return omap;
  }
  return makeOrderedMap(newMap, newList);
}
function isStack(maybeStack) {
  return Boolean(maybeStack && // @ts-expect-error: maybeStack is typed as `{}`, need to change in 6.0 to `maybeStack && typeof maybeStack === 'object' && MAYBE_STACK_SYMBOL in maybeStack`
  maybeStack[IS_STACK_SYMBOL]);
}
function makeStack(size, head, ownerID, hash2) {
  var map4 = Object.create(StackPrototype);
  map4.size = size;
  map4._head = head;
  map4.__ownerID = ownerID;
  map4.__hash = hash2;
  map4.__altered = false;
  return map4;
}
function emptyStack() {
  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
}
function reduce(collection, reducer, reduction, context, useFirst, reverse6) {
  assertNotInfinite(collection.size);
  collection.__iterate(function(v, k, c) {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse6);
  return reduction;
}
function keyMapper(v, k) {
  return k;
}
function entryMapper(v, k) {
  return [
    k,
    v
  ];
}
function not(predicate) {
  return function() {
    var args = [], len6 = arguments.length;
    while (len6--) args[len6] = arguments[len6];
    return !predicate.apply(this, args);
  };
}
function neg(predicate) {
  return function() {
    var args = [], len6 = arguments.length;
    while (len6--) args[len6] = arguments[len6];
    return -predicate.apply(this, args);
  };
}
function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}
function isSet(maybeSet) {
  return Boolean(maybeSet && // @ts-expect-error: maybeSet is typed as `{}`,  need to change in 6.0 to `maybeSeq && typeof maybeSet === 'object' && MAYBE_SET_SYMBOL in maybeSet`
  maybeSet[IS_SET_SYMBOL]);
}
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (!isCollection(b) || // @ts-expect-error size should exists on Collection
  a.size !== void 0 && b.size !== void 0 && a.size !== b.size || // @ts-expect-error __hash exists on Collection
  a.__hash !== void 0 && // @ts-expect-error __hash exists on Collection
  b.__hash !== void 0 && // @ts-expect-error __hash exists on Collection
  a.__hash !== b.__hash || isKeyed(a) !== isKeyed(b) || isIndexed(a) !== isIndexed(b) || // @ts-expect-error Range extends Collection, which implements [Symbol.iterator], so it is valid
  isOrdered(a) !== isOrdered(b)) {
    return false;
  }
  if (a.size === 0 && b.size === 0) {
    return true;
  }
  var notAssociative = !isAssociative(a);
  if (isOrdered(a) && !isMap(a) && !isSet(a)) {
    var entries3 = a.entries();
    return b.every(function(v, k) {
      var entry = entries3.next().value;
      return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
    }) && entries3.next().done;
  }
  var flipped = false;
  if (a.size === void 0) {
    if (b.size === void 0) {
      if (!isOrdered(a) && typeof a.cacheResult === "function") {
        a.cacheResult();
      }
    } else {
      flipped = true;
      var _ = a;
      a = b;
      b = _;
    }
  }
  var allEqual = true;
  var bSize = (
    // @ts-expect-error b is Range | Repeat | Collection<unknown, unknown> as it may have been flipped, and __iterate is valid
    b.__iterate(function(v, k) {
      if (notAssociative ? !a.has(v) : flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
        allEqual = false;
        return false;
      }
    })
  );
  return allEqual && // @ts-expect-error size should exists on Collection
  a.size === bSize;
}
function updateSet(set7, newMap) {
  if (set7.__ownerID) {
    set7.size = newMap.size;
    set7._map = newMap;
    return set7;
  }
  return newMap === set7._map ? set7 : newMap.size === 0 ? set7.__empty() : set7.__make(newMap);
}
function makeSet(map4, ownerID) {
  var set7 = Object.create(SetPrototype);
  set7.size = map4 ? map4.size : 0;
  set7._map = map4;
  set7.__ownerID = ownerID;
  return set7;
}
function emptySet() {
  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
}
function getIn$1(collection, searchKeyPath, notSetValue) {
  var keyPath = coerceKeyPath(searchKeyPath);
  var i = 0;
  while (i !== keyPath.length) {
    collection = get6(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}
function getIn(searchKeyPath, notSetValue) {
  return getIn$1(this, searchKeyPath, notSetValue);
}
function hasIn$1(collection, keyPath) {
  return getIn$1(collection, keyPath, NOT_SET) !== NOT_SET;
}
function hasIn(searchKeyPath) {
  return hasIn$1(this, searchKeyPath);
}
function toObject() {
  assertNotInfinite(this.size);
  var object = {};
  this.__iterate(function(v, k) {
    object[k] = v;
  });
  return object;
}
function toJS(value) {
  if (!value || typeof value !== "object") {
    return value;
  }
  if (!isCollection(value)) {
    if (!isDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (isKeyed(value)) {
    var result$1 = {};
    value.__iterate(function(v, k) {
      result$1[k] = toJS(v);
    });
    return result$1;
  }
  var result = [];
  value.__iterate(function(v) {
    result.push(toJS(v));
  });
  return result;
}
function hashCollection(collection) {
  if (collection.size === Infinity) {
    return 0;
  }
  var ordered = isOrdered(collection) && !isMap(collection) && !isSet(collection);
  var keyed = isKeyed(collection);
  var h2 = ordered ? 1 : 0;
  collection.__iterate(keyed ? ordered ? function(v, k) {
    h2 = 31 * h2 + hashMerge(hash(v), hash(k)) | 0;
  } : function(v, k) {
    h2 = h2 + hashMerge(hash(v), hash(k)) | 0;
  } : ordered ? function(v) {
    h2 = 31 * h2 + hash(v) | 0;
  } : function(v) {
    h2 = h2 + hash(v) | 0;
  });
  return murmurHashOfSize(collection.size, h2);
}
function murmurHashOfSize(size, h2) {
  h2 = imul(h2, 3432918353);
  h2 = imul(h2 << 15 | h2 >>> -15, 461845907);
  h2 = imul(h2 << 13 | h2 >>> -13, 5);
  h2 = (h2 + 3864292196 | 0) ^ size;
  h2 = imul(h2 ^ h2 >>> 16, 2246822507);
  h2 = imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = smi(h2 ^ h2 >>> 16);
  return h2;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function mixin(ctor, methods) {
  var keyCopier = function(key) {
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}
function defaultZipper() {
  return arrCopy(arguments);
}
function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}
function makeOrderedSet(map4, ownerID) {
  var set7 = Object.create(OrderedSetPrototype);
  set7.size = map4 ? map4.size : 0;
  set7._map = map4;
  set7.__ownerID = ownerID;
  return set7;
}
function emptyOrderedSet() {
  return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
}
function throwOnInvalidDefaultValues(defaultValues) {
  if (isRecord(defaultValues)) {
    throw new Error("Can not call `Record` with an immutable Record as default values. Use a plain javascript object instead.");
  }
  if (isImmutable(defaultValues)) {
    throw new Error("Can not call `Record` with an immutable Collection as default values. Use a plain javascript object instead.");
  }
  if (defaultValues === null || typeof defaultValues !== "object") {
    throw new Error("Can not call `Record` with a non-object as default values. Use a plain javascript object instead.");
  }
}
function makeRecord(likeRecord, values3, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._values = values3;
  record.__ownerID = ownerID;
  return record;
}
function recordName(record) {
  return record.constructor.displayName || record.constructor.name || "Record";
}
function recordSeq(record) {
  return keyedSeqFromValue(record._keys.map(function(k) {
    return [
      k,
      record.get(k)
    ];
  }));
}
function setProp(prototype, name) {
  try {
    Object.defineProperty(prototype, name, {
      get: function() {
        return this.get(name);
      },
      set: function(value) {
        invariant(this.__ownerID, "Cannot set on an immutable record.");
        this.set(name, value);
      }
    });
  } catch (error2) {
  }
}
function fromJS(value, converter) {
  return fromJSWith([], converter || defaultConverter, value, "", converter && converter.length > 2 ? [] : void 0, {
    "": value
  });
}
function fromJSWith(stack, converter, value, key, keyPath, parentValue) {
  if (typeof value !== "string" && !isImmutable(value) && (isArrayLike(value) || hasIterator(value) || isPlainObject(value))) {
    if (~stack.indexOf(value)) {
      throw new TypeError("Cannot convert circular structure to Immutable");
    }
    stack.push(value);
    keyPath && key !== "" && keyPath.push(key);
    var converted = converter.call(parentValue, key, Seq(value).map(function(v, k) {
      return fromJSWith(stack, converter, v, k, keyPath, value);
    }), keyPath && keyPath.slice());
    stack.pop();
    keyPath && keyPath.pop();
    return converted;
  }
  return value;
}
function defaultConverter(k, v) {
  return isIndexed(v) ? v.toList() : isKeyed(v) ? v.toMap() : v.toSet();
}
var IS_INDEXED_SYMBOL, IS_KEYED_SYMBOL, IS_COLLECTION_SYMBOL, Collection, KeyedCollection, IndexedCollection, SetCollection, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES, REAL_ITERATOR_SYMBOL, FAUX_ITERATOR_SYMBOL, ITERATOR_SYMBOL, Iterator, DELETE, SHIFT, SIZE, MASK, NOT_SET, IS_RECORD_SYMBOL, IS_ORDERED_SYMBOL, IS_SEQ_SYMBOL, hasOwnProperty, Seq, KeyedSeq, IndexedSeq, SetSeq, ArraySeq, ObjectSeq, CollectionSeq, EMPTY_SEQ, imul, defaultValueOf, isExtensible, canDefineProperty, usingWeakMap, weakMap, symbolMap, _objHashUID, UID_HASH_KEY, STRING_HASH_CACHE_MIN_STRLEN, STRING_HASH_CACHE_MAX_SIZE, STRING_HASH_CACHE_SIZE, stringHashCache, ToKeyedSequence, ToIndexedSequence, ToSetSequence, FromEntriesSequence, ConcatSeq, toString2, IS_MAP_SYMBOL, Map2, MapPrototype, ArrayMapNode, BitmapIndexedNode, HashArrayMapNode, HashCollisionNode, ValueNode, MapIterator, EMPTY_MAP, MAX_ARRAY_MAP_SIZE, MAX_BITMAP_INDEXED_SIZE, MIN_HASH_ARRAY_MAP_SIZE, IS_LIST_SYMBOL, List, ListPrototype, VNode, DONE, OrderedMap, EMPTY_ORDERED_MAP, IS_STACK_SYMBOL, Stack, StackPrototype, EMPTY_STACK, IS_SET_SYMBOL, Range, EMPTY_RANGE, Set2, SetPrototype, EMPTY_SET, CollectionPrototype, KeyedCollectionPrototype, IndexedCollectionPrototype, SetCollectionPrototype, OrderedSet, OrderedSetPrototype, EMPTY_ORDERED_SET, PairSorting, Record, RecordPrototype, Repeat, EMPTY_REPEAT, version, Iterable, immutable_default;
var init_immutable = __esm({
  "immutable/immutable.js"() {
    IS_INDEXED_SYMBOL = "@@__IMMUTABLE_INDEXED__@@";
    IS_KEYED_SYMBOL = "@@__IMMUTABLE_KEYED__@@";
    IS_COLLECTION_SYMBOL = "@@__IMMUTABLE_ITERABLE__@@";
    Collection = function Collection2(value) {
      return isCollection(value) ? value : Seq(value);
    };
    KeyedCollection = /* @__PURE__ */ function(Collection3) {
      function KeyedCollection2(value) {
        return isKeyed(value) ? value : KeyedSeq(value);
      }
      if (Collection3) KeyedCollection2.__proto__ = Collection3;
      KeyedCollection2.prototype = Object.create(Collection3 && Collection3.prototype);
      KeyedCollection2.prototype.constructor = KeyedCollection2;
      return KeyedCollection2;
    }(Collection);
    IndexedCollection = /* @__PURE__ */ function(Collection3) {
      function IndexedCollection2(value) {
        return isIndexed(value) ? value : IndexedSeq(value);
      }
      if (Collection3) IndexedCollection2.__proto__ = Collection3;
      IndexedCollection2.prototype = Object.create(Collection3 && Collection3.prototype);
      IndexedCollection2.prototype.constructor = IndexedCollection2;
      return IndexedCollection2;
    }(Collection);
    SetCollection = /* @__PURE__ */ function(Collection3) {
      function SetCollection2(value) {
        return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
      }
      if (Collection3) SetCollection2.__proto__ = Collection3;
      SetCollection2.prototype = Object.create(Collection3 && Collection3.prototype);
      SetCollection2.prototype.constructor = SetCollection2;
      return SetCollection2;
    }(Collection);
    Collection.Keyed = KeyedCollection;
    Collection.Indexed = IndexedCollection;
    Collection.Set = SetCollection;
    ITERATE_KEYS = 0;
    ITERATE_VALUES = 1;
    ITERATE_ENTRIES = 2;
    REAL_ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
    FAUX_ITERATOR_SYMBOL = "@@iterator";
    ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;
    Iterator = function Iterator2(next) {
      this.next = next;
    };
    Iterator.prototype.toString = function toString() {
      return "[Iterator]";
    };
    Iterator.KEYS = ITERATE_KEYS;
    Iterator.VALUES = ITERATE_VALUES;
    Iterator.ENTRIES = ITERATE_ENTRIES;
    Iterator.prototype.inspect = Iterator.prototype.toSource = function() {
      return this.toString();
    };
    Iterator.prototype[ITERATOR_SYMBOL] = function() {
      return this;
    };
    DELETE = "delete";
    SHIFT = 5;
    SIZE = 1 << SHIFT;
    MASK = SIZE - 1;
    NOT_SET = {};
    IS_RECORD_SYMBOL = "@@__IMMUTABLE_RECORD__@@";
    IS_ORDERED_SYMBOL = "@@__IMMUTABLE_ORDERED__@@";
    IS_SEQ_SYMBOL = "@@__IMMUTABLE_SEQ__@@";
    hasOwnProperty = Object.prototype.hasOwnProperty;
    Seq = /* @__PURE__ */ function(Collection3) {
      function Seq2(value) {
        return value === void 0 || value === null ? emptySequence() : isImmutable(value) ? value.toSeq() : seqFromValue(value);
      }
      if (Collection3) Seq2.__proto__ = Collection3;
      Seq2.prototype = Object.create(Collection3 && Collection3.prototype);
      Seq2.prototype.constructor = Seq2;
      Seq2.prototype.toSeq = function toSeq3() {
        return this;
      };
      Seq2.prototype.toString = function toString5() {
        return this.__toString("Seq {", "}");
      };
      Seq2.prototype.cacheResult = function cacheResult() {
        if (!this._cache && this.__iterateUncached) {
          this._cache = this.entrySeq().toArray();
          this.size = this._cache.length;
        }
        return this;
      };
      Seq2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var cache3 = this._cache;
        if (cache3) {
          var size = cache3.length;
          var i = 0;
          while (i !== size) {
            var entry = cache3[reverse6 ? size - ++i : i++];
            if (fn(entry[1], entry[0], this) === false) {
              break;
            }
          }
          return i;
        }
        return this.__iterateUncached(fn, reverse6);
      };
      Seq2.prototype.__iterator = function __iterator2(type, reverse6) {
        var cache3 = this._cache;
        if (cache3) {
          var size = cache3.length;
          var i = 0;
          return new Iterator(function() {
            if (i === size) {
              return iteratorDone();
            }
            var entry = cache3[reverse6 ? size - ++i : i++];
            return iteratorValue(type, entry[0], entry[1]);
          });
        }
        return this.__iteratorUncached(type, reverse6);
      };
      return Seq2;
    }(Collection);
    KeyedSeq = /* @__PURE__ */ function(Seq2) {
      function KeyedSeq2(value) {
        return value === void 0 || value === null ? emptySequence().toKeyedSeq() : isCollection(value) ? isKeyed(value) ? value.toSeq() : value.fromEntrySeq() : isRecord(value) ? value.toSeq() : keyedSeqFromValue(value);
      }
      if (Seq2) KeyedSeq2.__proto__ = Seq2;
      KeyedSeq2.prototype = Object.create(Seq2 && Seq2.prototype);
      KeyedSeq2.prototype.constructor = KeyedSeq2;
      KeyedSeq2.prototype.toKeyedSeq = function toKeyedSeq3() {
        return this;
      };
      return KeyedSeq2;
    }(Seq);
    IndexedSeq = /* @__PURE__ */ function(Seq2) {
      function IndexedSeq2(value) {
        return value === void 0 || value === null ? emptySequence() : isCollection(value) ? isKeyed(value) ? value.entrySeq() : value.toIndexedSeq() : isRecord(value) ? value.toSeq().entrySeq() : indexedSeqFromValue(value);
      }
      if (Seq2) IndexedSeq2.__proto__ = Seq2;
      IndexedSeq2.prototype = Object.create(Seq2 && Seq2.prototype);
      IndexedSeq2.prototype.constructor = IndexedSeq2;
      IndexedSeq2.of = function of8() {
        return IndexedSeq2(arguments);
      };
      IndexedSeq2.prototype.toIndexedSeq = function toIndexedSeq2() {
        return this;
      };
      IndexedSeq2.prototype.toString = function toString5() {
        return this.__toString("Seq [", "]");
      };
      return IndexedSeq2;
    }(Seq);
    SetSeq = /* @__PURE__ */ function(Seq2) {
      function SetSeq2(value) {
        return (isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)).toSetSeq();
      }
      if (Seq2) SetSeq2.__proto__ = Seq2;
      SetSeq2.prototype = Object.create(Seq2 && Seq2.prototype);
      SetSeq2.prototype.constructor = SetSeq2;
      SetSeq2.of = function of8() {
        return SetSeq2(arguments);
      };
      SetSeq2.prototype.toSetSeq = function toSetSeq2() {
        return this;
      };
      return SetSeq2;
    }(Seq);
    Seq.isSeq = isSeq;
    Seq.Keyed = KeyedSeq;
    Seq.Set = SetSeq;
    Seq.Indexed = IndexedSeq;
    Seq.prototype[IS_SEQ_SYMBOL] = true;
    ArraySeq = /* @__PURE__ */ function(IndexedSeq2) {
      function ArraySeq2(array) {
        this._array = array;
        this.size = array.length;
      }
      if (IndexedSeq2) ArraySeq2.__proto__ = IndexedSeq2;
      ArraySeq2.prototype = Object.create(IndexedSeq2 && IndexedSeq2.prototype);
      ArraySeq2.prototype.constructor = ArraySeq2;
      ArraySeq2.prototype.get = function get16(index, notSetValue) {
        return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
      };
      ArraySeq2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var array = this._array;
        var size = array.length;
        var i = 0;
        while (i !== size) {
          var ii = reverse6 ? size - ++i : i++;
          if (fn(array[ii], ii, this) === false) {
            break;
          }
        }
        return i;
      };
      ArraySeq2.prototype.__iterator = function __iterator2(type, reverse6) {
        var array = this._array;
        var size = array.length;
        var i = 0;
        return new Iterator(function() {
          if (i === size) {
            return iteratorDone();
          }
          var ii = reverse6 ? size - ++i : i++;
          return iteratorValue(type, ii, array[ii]);
        });
      };
      return ArraySeq2;
    }(IndexedSeq);
    ObjectSeq = /* @__PURE__ */ function(KeyedSeq2) {
      function ObjectSeq2(object) {
        var keys3 = Object.keys(object).concat(Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : []);
        this._object = object;
        this._keys = keys3;
        this.size = keys3.length;
      }
      if (KeyedSeq2) ObjectSeq2.__proto__ = KeyedSeq2;
      ObjectSeq2.prototype = Object.create(KeyedSeq2 && KeyedSeq2.prototype);
      ObjectSeq2.prototype.constructor = ObjectSeq2;
      ObjectSeq2.prototype.get = function get16(key, notSetValue) {
        if (notSetValue !== void 0 && !this.has(key)) {
          return notSetValue;
        }
        return this._object[key];
      };
      ObjectSeq2.prototype.has = function has10(key) {
        return hasOwnProperty.call(this._object, key);
      };
      ObjectSeq2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var object = this._object;
        var keys3 = this._keys;
        var size = keys3.length;
        var i = 0;
        while (i !== size) {
          var key = keys3[reverse6 ? size - ++i : i++];
          if (fn(object[key], key, this) === false) {
            break;
          }
        }
        return i;
      };
      ObjectSeq2.prototype.__iterator = function __iterator2(type, reverse6) {
        var object = this._object;
        var keys3 = this._keys;
        var size = keys3.length;
        var i = 0;
        return new Iterator(function() {
          if (i === size) {
            return iteratorDone();
          }
          var key = keys3[reverse6 ? size - ++i : i++];
          return iteratorValue(type, key, object[key]);
        });
      };
      return ObjectSeq2;
    }(KeyedSeq);
    ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;
    CollectionSeq = /* @__PURE__ */ function(IndexedSeq2) {
      function CollectionSeq2(collection) {
        this._collection = collection;
        this.size = collection.length || collection.size;
      }
      if (IndexedSeq2) CollectionSeq2.__proto__ = IndexedSeq2;
      CollectionSeq2.prototype = Object.create(IndexedSeq2 && IndexedSeq2.prototype);
      CollectionSeq2.prototype.constructor = CollectionSeq2;
      CollectionSeq2.prototype.__iterateUncached = function __iterateUncached(fn, reverse6) {
        if (reverse6) {
          return this.cacheResult().__iterate(fn, reverse6);
        }
        var collection = this._collection;
        var iterator = getIterator(collection);
        var iterations = 0;
        if (isIterator(iterator)) {
          var step;
          while (!(step = iterator.next()).done) {
            if (fn(step.value, iterations++, this) === false) {
              break;
            }
          }
        }
        return iterations;
      };
      CollectionSeq2.prototype.__iteratorUncached = function __iteratorUncached(type, reverse6) {
        if (reverse6) {
          return this.cacheResult().__iterator(type, reverse6);
        }
        var collection = this._collection;
        var iterator = getIterator(collection);
        if (!isIterator(iterator)) {
          return new Iterator(iteratorDone);
        }
        var iterations = 0;
        return new Iterator(function() {
          var step = iterator.next();
          return step.done ? step : iteratorValue(type, iterations++, step.value);
        });
      };
      return CollectionSeq2;
    }(IndexedSeq);
    imul = typeof Math.imul === "function" && Math.imul(4294967295, 2) === -2 ? Math.imul : function imul2(a, b) {
      a |= 0;
      b |= 0;
      var c = a & 65535;
      var d = b & 65535;
      return c * d + ((a >>> 16) * d + c * (b >>> 16) << 16 >>> 0) | 0;
    };
    defaultValueOf = Object.prototype.valueOf;
    isExtensible = Object.isExtensible;
    canDefineProperty = function() {
      try {
        Object.defineProperty({}, "@", {});
        return true;
      } catch (e2) {
        return false;
      }
    }();
    usingWeakMap = typeof WeakMap === "function";
    if (usingWeakMap) {
      weakMap = /* @__PURE__ */ new WeakMap();
    }
    symbolMap = /* @__PURE__ */ Object.create(null);
    _objHashUID = 0;
    UID_HASH_KEY = "__immutablehash__";
    if (typeof Symbol === "function") {
      UID_HASH_KEY = Symbol(UID_HASH_KEY);
    }
    STRING_HASH_CACHE_MIN_STRLEN = 16;
    STRING_HASH_CACHE_MAX_SIZE = 255;
    STRING_HASH_CACHE_SIZE = 0;
    stringHashCache = {};
    ToKeyedSequence = /* @__PURE__ */ function(KeyedSeq2) {
      function ToKeyedSequence2(indexed, useKeys) {
        this._iter = indexed;
        this._useKeys = useKeys;
        this.size = indexed.size;
      }
      if (KeyedSeq2) ToKeyedSequence2.__proto__ = KeyedSeq2;
      ToKeyedSequence2.prototype = Object.create(KeyedSeq2 && KeyedSeq2.prototype);
      ToKeyedSequence2.prototype.constructor = ToKeyedSequence2;
      ToKeyedSequence2.prototype.get = function get16(key, notSetValue) {
        return this._iter.get(key, notSetValue);
      };
      ToKeyedSequence2.prototype.has = function has10(key) {
        return this._iter.has(key);
      };
      ToKeyedSequence2.prototype.valueSeq = function valueSeq2() {
        return this._iter.valueSeq();
      };
      ToKeyedSequence2.prototype.reverse = function reverse6() {
        var this$1$1 = this;
        var reversedSequence = reverseFactory(this, true);
        if (!this._useKeys) {
          reversedSequence.valueSeq = function() {
            return this$1$1._iter.toSeq().reverse();
          };
        }
        return reversedSequence;
      };
      ToKeyedSequence2.prototype.map = function map4(mapper, context) {
        var this$1$1 = this;
        var mappedSequence = mapFactory(this, mapper, context);
        if (!this._useKeys) {
          mappedSequence.valueSeq = function() {
            return this$1$1._iter.toSeq().map(mapper, context);
          };
        }
        return mappedSequence;
      };
      ToKeyedSequence2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        return this._iter.__iterate(function(v, k) {
          return fn(v, k, this$1$1);
        }, reverse6);
      };
      ToKeyedSequence2.prototype.__iterator = function __iterator2(type, reverse6) {
        return this._iter.__iterator(type, reverse6);
      };
      return ToKeyedSequence2;
    }(KeyedSeq);
    ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;
    ToIndexedSequence = /* @__PURE__ */ function(IndexedSeq2) {
      function ToIndexedSequence2(iter) {
        this._iter = iter;
        this.size = iter.size;
      }
      if (IndexedSeq2) ToIndexedSequence2.__proto__ = IndexedSeq2;
      ToIndexedSequence2.prototype = Object.create(IndexedSeq2 && IndexedSeq2.prototype);
      ToIndexedSequence2.prototype.constructor = ToIndexedSequence2;
      ToIndexedSequence2.prototype.includes = function includes3(value) {
        return this._iter.includes(value);
      };
      ToIndexedSequence2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        var i = 0;
        reverse6 && ensureSize(this);
        return this._iter.__iterate(function(v) {
          return fn(v, reverse6 ? this$1$1.size - ++i : i++, this$1$1);
        }, reverse6);
      };
      ToIndexedSequence2.prototype.__iterator = function __iterator2(type, reverse6) {
        var this$1$1 = this;
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse6);
        var i = 0;
        reverse6 && ensureSize(this);
        return new Iterator(function() {
          var step = iterator.next();
          return step.done ? step : iteratorValue(type, reverse6 ? this$1$1.size - ++i : i++, step.value, step);
        });
      };
      return ToIndexedSequence2;
    }(IndexedSeq);
    ToSetSequence = /* @__PURE__ */ function(SetSeq2) {
      function ToSetSequence2(iter) {
        this._iter = iter;
        this.size = iter.size;
      }
      if (SetSeq2) ToSetSequence2.__proto__ = SetSeq2;
      ToSetSequence2.prototype = Object.create(SetSeq2 && SetSeq2.prototype);
      ToSetSequence2.prototype.constructor = ToSetSequence2;
      ToSetSequence2.prototype.has = function has10(key) {
        return this._iter.includes(key);
      };
      ToSetSequence2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        return this._iter.__iterate(function(v) {
          return fn(v, v, this$1$1);
        }, reverse6);
      };
      ToSetSequence2.prototype.__iterator = function __iterator2(type, reverse6) {
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse6);
        return new Iterator(function() {
          var step = iterator.next();
          return step.done ? step : iteratorValue(type, step.value, step.value, step);
        });
      };
      return ToSetSequence2;
    }(SetSeq);
    FromEntriesSequence = /* @__PURE__ */ function(KeyedSeq2) {
      function FromEntriesSequence2(entries3) {
        this._iter = entries3;
        this.size = entries3.size;
      }
      if (KeyedSeq2) FromEntriesSequence2.__proto__ = KeyedSeq2;
      FromEntriesSequence2.prototype = Object.create(KeyedSeq2 && KeyedSeq2.prototype);
      FromEntriesSequence2.prototype.constructor = FromEntriesSequence2;
      FromEntriesSequence2.prototype.entrySeq = function entrySeq2() {
        return this._iter.toSeq();
      };
      FromEntriesSequence2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        return this._iter.__iterate(function(entry) {
          if (entry) {
            validateEntry(entry);
            var indexedCollection = isCollection(entry);
            return fn(indexedCollection ? entry.get(1) : entry[1], indexedCollection ? entry.get(0) : entry[0], this$1$1);
          }
        }, reverse6);
      };
      FromEntriesSequence2.prototype.__iterator = function __iterator2(type, reverse6) {
        var iterator = this._iter.__iterator(ITERATE_VALUES, reverse6);
        return new Iterator(function() {
          while (true) {
            var step = iterator.next();
            if (step.done) {
              return step;
            }
            var entry = step.value;
            if (entry) {
              validateEntry(entry);
              var indexedCollection = isCollection(entry);
              return iteratorValue(type, indexedCollection ? entry.get(0) : entry[0], indexedCollection ? entry.get(1) : entry[1], step);
            }
          }
        });
      };
      return FromEntriesSequence2;
    }(KeyedSeq);
    ToIndexedSequence.prototype.cacheResult = ToKeyedSequence.prototype.cacheResult = ToSetSequence.prototype.cacheResult = FromEntriesSequence.prototype.cacheResult = cacheResultThrough;
    ConcatSeq = /* @__PURE__ */ function(Seq2) {
      function ConcatSeq2(iterables) {
        this._wrappedIterables = iterables.flatMap(function(iterable) {
          if (iterable._wrappedIterables) {
            return iterable._wrappedIterables;
          }
          return [
            iterable
          ];
        });
        this.size = this._wrappedIterables.reduce(function(sum2, iterable) {
          if (sum2 !== void 0) {
            var size = iterable.size;
            if (size !== void 0) {
              return sum2 + size;
            }
          }
        }, 0);
        this[IS_KEYED_SYMBOL] = this._wrappedIterables[0][IS_KEYED_SYMBOL];
        this[IS_INDEXED_SYMBOL] = this._wrappedIterables[0][IS_INDEXED_SYMBOL];
        this[IS_ORDERED_SYMBOL] = this._wrappedIterables[0][IS_ORDERED_SYMBOL];
      }
      if (Seq2) ConcatSeq2.__proto__ = Seq2;
      ConcatSeq2.prototype = Object.create(Seq2 && Seq2.prototype);
      ConcatSeq2.prototype.constructor = ConcatSeq2;
      ConcatSeq2.prototype.__iterateUncached = function __iterateUncached(fn, reverse6) {
        if (this._wrappedIterables.length === 0) {
          return;
        }
        if (reverse6) {
          return this.cacheResult().__iterate(fn, reverse6);
        }
        var iterableIndex = 0;
        var useKeys = isKeyed(this);
        var iteratorType = useKeys ? ITERATE_ENTRIES : ITERATE_VALUES;
        var currentIterator = this._wrappedIterables[iterableIndex].__iterator(iteratorType, reverse6);
        var keepGoing = true;
        var index = 0;
        while (keepGoing) {
          var next = currentIterator.next();
          while (next.done) {
            iterableIndex++;
            if (iterableIndex === this._wrappedIterables.length) {
              return index;
            }
            currentIterator = this._wrappedIterables[iterableIndex].__iterator(iteratorType, reverse6);
            next = currentIterator.next();
          }
          var fnResult = useKeys ? fn(next.value[1], next.value[0], this) : fn(next.value, index, this);
          keepGoing = fnResult !== false;
          index++;
        }
        return index;
      };
      ConcatSeq2.prototype.__iteratorUncached = function __iteratorUncached(type, reverse6) {
        var this$1$1 = this;
        if (this._wrappedIterables.length === 0) {
          return new Iterator(iteratorDone);
        }
        if (reverse6) {
          return this.cacheResult().__iterator(type, reverse6);
        }
        var iterableIndex = 0;
        var currentIterator = this._wrappedIterables[iterableIndex].__iterator(type, reverse6);
        return new Iterator(function() {
          var next = currentIterator.next();
          while (next.done) {
            iterableIndex++;
            if (iterableIndex === this$1$1._wrappedIterables.length) {
              return next;
            }
            currentIterator = this$1$1._wrappedIterables[iterableIndex].__iterator(type, reverse6);
            next = currentIterator.next();
          }
          return next;
        });
      };
      return ConcatSeq2;
    }(Seq);
    toString2 = Object.prototype.toString;
    IS_MAP_SYMBOL = "@@__IMMUTABLE_MAP__@@";
    Map2 = /* @__PURE__ */ function(KeyedCollection2) {
      function Map3(value) {
        return value === void 0 || value === null ? emptyMap() : isMap(value) && !isOrdered(value) ? value : emptyMap().withMutations(function(map4) {
          var iter = KeyedCollection2(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k) {
            return map4.set(k, v);
          });
        });
      }
      if (KeyedCollection2) Map3.__proto__ = KeyedCollection2;
      Map3.prototype = Object.create(KeyedCollection2 && KeyedCollection2.prototype);
      Map3.prototype.constructor = Map3;
      Map3.prototype.toString = function toString5() {
        return this.__toString("Map {", "}");
      };
      Map3.prototype.get = function get16(k, notSetValue) {
        return this._root ? this._root.get(0, void 0, k, notSetValue) : notSetValue;
      };
      Map3.prototype.set = function set7(k, v) {
        return updateMap(this, k, v);
      };
      Map3.prototype.remove = function remove7(k) {
        return updateMap(this, k, NOT_SET);
      };
      Map3.prototype.deleteAll = function deleteAll(keys3) {
        var collection = Collection(keys3);
        if (collection.size === 0) {
          return this;
        }
        return this.withMutations(function(map4) {
          collection.forEach(function(key) {
            return map4.remove(key);
          });
        });
      };
      Map3.prototype.clear = function clear3() {
        if (this.size === 0) {
          return this;
        }
        if (this.__ownerID) {
          this.size = 0;
          this._root = null;
          this.__hash = void 0;
          this.__altered = true;
          return this;
        }
        return emptyMap();
      };
      Map3.prototype.sort = function sort3(comparator) {
        return OrderedMap(sortFactory(this, comparator));
      };
      Map3.prototype.sortBy = function sortBy4(mapper, comparator) {
        return OrderedMap(sortFactory(this, comparator, mapper));
      };
      Map3.prototype.map = function map4(mapper, context) {
        var this$1$1 = this;
        return this.withMutations(function(map5) {
          map5.forEach(function(value, key) {
            map5.set(key, mapper.call(context, value, key, this$1$1));
          });
        });
      };
      Map3.prototype.__iterator = function __iterator2(type, reverse6) {
        return new MapIterator(this, type, reverse6);
      };
      Map3.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        var iterations = 0;
        this._root && this._root.iterate(function(entry) {
          iterations++;
          return fn(entry[1], entry[0], this$1$1);
        }, reverse6);
        return iterations;
      };
      Map3.prototype.__ensureOwner = function __ensureOwner2(ownerID) {
        if (ownerID === this.__ownerID) {
          return this;
        }
        if (!ownerID) {
          if (this.size === 0) {
            return emptyMap();
          }
          this.__ownerID = ownerID;
          this.__altered = false;
          return this;
        }
        return makeMap(this.size, this._root, ownerID, this.__hash);
      };
      return Map3;
    }(KeyedCollection);
    Map2.isMap = isMap;
    MapPrototype = Map2.prototype;
    MapPrototype[IS_MAP_SYMBOL] = true;
    MapPrototype[DELETE] = MapPrototype.remove;
    MapPrototype.removeAll = MapPrototype.deleteAll;
    MapPrototype.setIn = setIn;
    MapPrototype.removeIn = MapPrototype.deleteIn = deleteIn;
    MapPrototype.update = update;
    MapPrototype.updateIn = updateIn$1;
    MapPrototype.merge = MapPrototype.concat = merge$1;
    MapPrototype.mergeWith = mergeWith$1;
    MapPrototype.mergeDeep = mergeDeep;
    MapPrototype.mergeDeepWith = mergeDeepWith;
    MapPrototype.mergeIn = mergeIn;
    MapPrototype.mergeDeepIn = mergeDeepIn;
    MapPrototype.withMutations = withMutations;
    MapPrototype.wasAltered = wasAltered;
    MapPrototype.asImmutable = asImmutable;
    MapPrototype["@@transducer/init"] = MapPrototype.asMutable = asMutable;
    MapPrototype["@@transducer/step"] = function(result, arr) {
      return result.set(arr[0], arr[1]);
    };
    MapPrototype["@@transducer/result"] = function(obj) {
      return obj.asImmutable();
    };
    ArrayMapNode = function ArrayMapNode2(ownerID, entries3) {
      this.ownerID = ownerID;
      this.entries = entries3;
    };
    ArrayMapNode.prototype.get = function get(shift, keyHash, key, notSetValue) {
      var entries3 = this.entries;
      for (var ii = 0, len6 = entries3.length; ii < len6; ii++) {
        if (is(key, entries3[ii][0])) {
          return entries3[ii][1];
        }
      }
      return notSetValue;
    };
    ArrayMapNode.prototype.update = function update2(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var entries3 = this.entries;
      var idx = 0;
      var len6 = entries3.length;
      for (; idx < len6; idx++) {
        if (is(key, entries3[idx][0])) {
          break;
        }
      }
      var exists = idx < len6;
      if (exists ? entries3[idx][1] === value : removed) {
        return this;
      }
      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);
      if (removed && entries3.length === 1) {
        return;
      }
      if (!exists && !removed && entries3.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries3, key, value);
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries3 : arrCopy(entries3);
      if (exists) {
        if (removed) {
          idx === len6 - 1 ? newEntries.pop() : newEntries[idx] = newEntries.pop();
        } else {
          newEntries[idx] = [
            key,
            value
          ];
        }
      } else {
        newEntries.push([
          key,
          value
        ]);
      }
      if (isEditable) {
        this.entries = newEntries;
        return this;
      }
      return new ArrayMapNode(ownerID, newEntries);
    };
    BitmapIndexedNode = function BitmapIndexedNode2(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    };
    BitmapIndexedNode.prototype.get = function get2(shift, keyHash, key, notSetValue) {
      if (keyHash === void 0) {
        keyHash = hash(key);
      }
      var bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & bit - 1)].get(shift + SHIFT, keyHash, key, notSetValue);
    };
    BitmapIndexedNode.prototype.update = function update3(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === void 0) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;
      if (!exists && value === NOT_SET) {
        return this;
      }
      var idx = popCount(bitmap & bit - 1);
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : void 0;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }
      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }
      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }
      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ? setAt(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }
      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };
    HashArrayMapNode = function HashArrayMapNode2(ownerID, count3, nodes) {
      this.ownerID = ownerID;
      this.count = count3;
      this.nodes = nodes;
    };
    HashArrayMapNode.prototype.get = function get3(shift, keyHash, key, notSetValue) {
      if (keyHash === void 0) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };
    HashArrayMapNode.prototype.update = function update4(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === void 0) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];
      if (removed && !node) {
        return this;
      }
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }
      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setAt(nodes, idx, newNode, isEditable);
      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }
      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };
    HashCollisionNode = function HashCollisionNode2(ownerID, keyHash, entries3) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries3;
    };
    HashCollisionNode.prototype.get = function get4(shift, keyHash, key, notSetValue) {
      var entries3 = this.entries;
      for (var ii = 0, len6 = entries3.length; ii < len6; ii++) {
        if (is(key, entries3[ii][0])) {
          return entries3[ii][1];
        }
      }
      return notSetValue;
    };
    HashCollisionNode.prototype.update = function update5(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === void 0) {
        keyHash = hash(key);
      }
      var removed = value === NOT_SET;
      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [
          key,
          value
        ]);
      }
      var entries3 = this.entries;
      var idx = 0;
      var len6 = entries3.length;
      for (; idx < len6; idx++) {
        if (is(key, entries3[idx][0])) {
          break;
        }
      }
      var exists = idx < len6;
      if (exists ? entries3[idx][1] === value : removed) {
        return this;
      }
      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);
      if (removed && len6 === 2) {
        return new ValueNode(ownerID, this.keyHash, entries3[idx ^ 1]);
      }
      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries3 : arrCopy(entries3);
      if (exists) {
        if (removed) {
          idx === len6 - 1 ? newEntries.pop() : newEntries[idx] = newEntries.pop();
        } else {
          newEntries[idx] = [
            key,
            value
          ];
        }
      } else {
        newEntries.push([
          key,
          value
        ]);
      }
      if (isEditable) {
        this.entries = newEntries;
        return this;
      }
      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };
    ValueNode = function ValueNode2(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    };
    ValueNode.prototype.get = function get5(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };
    ValueNode.prototype.update = function update6(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }
      SetRef(didAlter);
      if (removed) {
        SetRef(didChangeSize);
        return;
      }
      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [
          key,
          value
        ]);
      }
      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [
        key,
        value
      ]);
    };
    ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate = function(fn, reverse6) {
      var entries3 = this.entries;
      for (var ii = 0, maxIndex = entries3.length - 1; ii <= maxIndex; ii++) {
        if (fn(entries3[reverse6 ? maxIndex - ii : ii]) === false) {
          return false;
        }
      }
    };
    BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate = function(fn, reverse6) {
      var nodes = this.nodes;
      for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
        var node = nodes[reverse6 ? maxIndex - ii : ii];
        if (node && node.iterate(fn, reverse6) === false) {
          return false;
        }
      }
    };
    ValueNode.prototype.iterate = function(fn, reverse6) {
      return fn(this.entry);
    };
    MapIterator = /* @__PURE__ */ function(Iterator3) {
      function MapIterator2(map4, type, reverse6) {
        this._type = type;
        this._reverse = reverse6;
        this._stack = map4._root && mapIteratorFrame(map4._root);
      }
      if (Iterator3) MapIterator2.__proto__ = Iterator3;
      MapIterator2.prototype = Object.create(Iterator3 && Iterator3.prototype);
      MapIterator2.prototype.constructor = MapIterator2;
      MapIterator2.prototype.next = function next() {
        var type = this._type;
        var stack = this._stack;
        while (stack) {
          var node = stack.node;
          var index = stack.index++;
          var maxIndex = void 0;
          if (node.entry) {
            if (index === 0) {
              return mapIteratorValue(type, node.entry);
            }
          } else if (node.entries) {
            maxIndex = node.entries.length - 1;
            if (index <= maxIndex) {
              return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
            }
          } else {
            maxIndex = node.nodes.length - 1;
            if (index <= maxIndex) {
              var subNode = node.nodes[this._reverse ? maxIndex - index : index];
              if (subNode) {
                if (subNode.entry) {
                  return mapIteratorValue(type, subNode.entry);
                }
                stack = this._stack = mapIteratorFrame(subNode, stack);
              }
              continue;
            }
          }
          stack = this._stack = this._stack.__prev;
        }
        return iteratorDone();
      };
      return MapIterator2;
    }(Iterator);
    MAX_ARRAY_MAP_SIZE = SIZE / 4;
    MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
    MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;
    IS_LIST_SYMBOL = "@@__IMMUTABLE_LIST__@@";
    List = /* @__PURE__ */ function(IndexedCollection2) {
      function List2(value) {
        var empty2 = emptyList();
        if (value === void 0 || value === null) {
          return empty2;
        }
        if (isList(value)) {
          return value;
        }
        var iter = IndexedCollection2(value);
        var size = iter.size;
        if (size === 0) {
          return empty2;
        }
        assertNotInfinite(size);
        if (size > 0 && size < SIZE) {
          return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
        }
        return empty2.withMutations(function(list2) {
          list2.setSize(size);
          iter.forEach(function(v, i) {
            return list2.set(i, v);
          });
        });
      }
      if (IndexedCollection2) List2.__proto__ = IndexedCollection2;
      List2.prototype = Object.create(IndexedCollection2 && IndexedCollection2.prototype);
      List2.prototype.constructor = List2;
      List2.of = function of8() {
        return this(arguments);
      };
      List2.prototype.toString = function toString5() {
        return this.__toString("List [", "]");
      };
      List2.prototype.get = function get16(index, notSetValue) {
        index = wrapIndex(this, index);
        if (index >= 0 && index < this.size) {
          index += this._origin;
          var node = listNodeFor(this, index);
          return node && node.array[index & MASK];
        }
        return notSetValue;
      };
      List2.prototype.set = function set7(index, value) {
        return updateList(this, index, value);
      };
      List2.prototype.remove = function remove7(index) {
        return !this.has(index) ? this : index === 0 ? this.shift() : index === this.size - 1 ? this.pop() : this.splice(index, 1);
      };
      List2.prototype.insert = function insert(index, value) {
        return this.splice(index, 0, value);
      };
      List2.prototype.clear = function clear3() {
        if (this.size === 0) {
          return this;
        }
        if (this.__ownerID) {
          this.size = this._origin = this._capacity = 0;
          this._level = SHIFT;
          this._root = this._tail = this.__hash = void 0;
          this.__altered = true;
          return this;
        }
        return emptyList();
      };
      List2.prototype.push = function push3() {
        var values3 = arguments;
        var oldSize = this.size;
        return this.withMutations(function(list2) {
          setListBounds(list2, 0, oldSize + values3.length);
          for (var ii = 0; ii < values3.length; ii++) {
            list2.set(oldSize + ii, values3[ii]);
          }
        });
      };
      List2.prototype.pop = function pop3() {
        return setListBounds(this, 0, -1);
      };
      List2.prototype.unshift = function unshift() {
        var values3 = arguments;
        return this.withMutations(function(list2) {
          setListBounds(list2, -values3.length);
          for (var ii = 0; ii < values3.length; ii++) {
            list2.set(ii, values3[ii]);
          }
        });
      };
      List2.prototype.shift = function shift() {
        return setListBounds(this, 1);
      };
      List2.prototype.shuffle = function shuffle2(random2) {
        if (random2 === void 0) random2 = Math.random;
        return this.withMutations(function(mutable) {
          var current = mutable.size;
          var destination;
          var tmp;
          while (current) {
            destination = Math.floor(random2() * current--);
            tmp = mutable.get(destination);
            mutable.set(destination, mutable.get(current));
            mutable.set(current, tmp);
          }
        });
      };
      List2.prototype.concat = function concat2() {
        var arguments$1 = arguments;
        var seqs = [];
        for (var i = 0; i < arguments.length; i++) {
          var argument = arguments$1[i];
          var seq = IndexedCollection2(typeof argument !== "string" && hasIterator(argument) ? argument : [
            argument
          ]);
          if (seq.size !== 0) {
            seqs.push(seq);
          }
        }
        if (seqs.length === 0) {
          return this;
        }
        if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
          return this.constructor(seqs[0]);
        }
        return this.withMutations(function(list2) {
          seqs.forEach(function(seq2) {
            return seq2.forEach(function(value) {
              return list2.push(value);
            });
          });
        });
      };
      List2.prototype.setSize = function setSize(size) {
        return setListBounds(this, 0, size);
      };
      List2.prototype.map = function map4(mapper, context) {
        var this$1$1 = this;
        return this.withMutations(function(list2) {
          for (var i = 0; i < this$1$1.size; i++) {
            list2.set(i, mapper.call(context, list2.get(i), i, this$1$1));
          }
        });
      };
      List2.prototype.slice = function slice3(begin, end) {
        var size = this.size;
        if (wholeSlice(begin, end, size)) {
          return this;
        }
        return setListBounds(this, resolveBegin(begin, size), resolveEnd(end, size));
      };
      List2.prototype.__iterator = function __iterator2(type, reverse6) {
        var index = reverse6 ? this.size : 0;
        var values3 = iterateList(this, reverse6);
        return new Iterator(function() {
          var value = values3();
          return value === DONE ? iteratorDone() : iteratorValue(type, reverse6 ? --index : index++, value);
        });
      };
      List2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var index = reverse6 ? this.size : 0;
        var values3 = iterateList(this, reverse6);
        var value;
        while ((value = values3()) !== DONE) {
          if (fn(value, reverse6 ? --index : index++, this) === false) {
            break;
          }
        }
        return index;
      };
      List2.prototype.__ensureOwner = function __ensureOwner2(ownerID) {
        if (ownerID === this.__ownerID) {
          return this;
        }
        if (!ownerID) {
          if (this.size === 0) {
            return emptyList();
          }
          this.__ownerID = ownerID;
          this.__altered = false;
          return this;
        }
        return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
      };
      return List2;
    }(IndexedCollection);
    List.isList = isList;
    ListPrototype = List.prototype;
    ListPrototype[IS_LIST_SYMBOL] = true;
    ListPrototype[DELETE] = ListPrototype.remove;
    ListPrototype.merge = ListPrototype.concat;
    ListPrototype.setIn = setIn;
    ListPrototype.deleteIn = ListPrototype.removeIn = deleteIn;
    ListPrototype.update = update;
    ListPrototype.updateIn = updateIn$1;
    ListPrototype.mergeIn = mergeIn;
    ListPrototype.mergeDeepIn = mergeDeepIn;
    ListPrototype.withMutations = withMutations;
    ListPrototype.wasAltered = wasAltered;
    ListPrototype.asImmutable = asImmutable;
    ListPrototype["@@transducer/init"] = ListPrototype.asMutable = asMutable;
    ListPrototype["@@transducer/step"] = function(result, arr) {
      return result.push(arr);
    };
    ListPrototype["@@transducer/result"] = function(obj) {
      return obj.asImmutable();
    };
    VNode = function VNode2(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    };
    VNode.prototype.removeBefore = function removeBefore(ownerID, level, index) {
      if ((index & (1 << level + SHIFT) - 1) === 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = index >>> level & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = void 0;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };
    VNode.prototype.removeAfter = function removeAfter(ownerID, level, index) {
      if (index === (level ? 1 << level + SHIFT : SIZE) || this.array.length === 0) {
        return this;
      }
      var sizeIndex = index - 1 >>> level & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }
      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
          return this;
        }
      }
      var editable = editableVNode(this, ownerID);
      editable.array.splice(sizeIndex + 1);
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };
    DONE = {};
    OrderedMap = /* @__PURE__ */ function(Map3) {
      function OrderedMap2(value) {
        return value === void 0 || value === null ? emptyOrderedMap() : isOrderedMap(value) ? value : emptyOrderedMap().withMutations(function(map4) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k) {
            return map4.set(k, v);
          });
        });
      }
      if (Map3) OrderedMap2.__proto__ = Map3;
      OrderedMap2.prototype = Object.create(Map3 && Map3.prototype);
      OrderedMap2.prototype.constructor = OrderedMap2;
      OrderedMap2.of = function of8() {
        return this(arguments);
      };
      OrderedMap2.prototype.toString = function toString5() {
        return this.__toString("OrderedMap {", "}");
      };
      OrderedMap2.prototype.get = function get16(k, notSetValue) {
        var index = this._map.get(k);
        return index !== void 0 ? this._list.get(index)[1] : notSetValue;
      };
      OrderedMap2.prototype.clear = function clear3() {
        if (this.size === 0) {
          return this;
        }
        if (this.__ownerID) {
          this.size = 0;
          this._map.clear();
          this._list.clear();
          this.__altered = true;
          return this;
        }
        return emptyOrderedMap();
      };
      OrderedMap2.prototype.set = function set7(k, v) {
        return updateOrderedMap(this, k, v);
      };
      OrderedMap2.prototype.remove = function remove7(k) {
        return updateOrderedMap(this, k, NOT_SET);
      };
      OrderedMap2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        return this._list.__iterate(function(entry) {
          return entry && fn(entry[1], entry[0], this$1$1);
        }, reverse6);
      };
      OrderedMap2.prototype.__iterator = function __iterator2(type, reverse6) {
        return this._list.fromEntrySeq().__iterator(type, reverse6);
      };
      OrderedMap2.prototype.__ensureOwner = function __ensureOwner2(ownerID) {
        if (ownerID === this.__ownerID) {
          return this;
        }
        var newMap = this._map.__ensureOwner(ownerID);
        var newList = this._list.__ensureOwner(ownerID);
        if (!ownerID) {
          if (this.size === 0) {
            return emptyOrderedMap();
          }
          this.__ownerID = ownerID;
          this.__altered = false;
          this._map = newMap;
          this._list = newList;
          return this;
        }
        return makeOrderedMap(newMap, newList, ownerID, this.__hash);
      };
      return OrderedMap2;
    }(Map2);
    OrderedMap.isOrderedMap = isOrderedMap;
    OrderedMap.prototype[IS_ORDERED_SYMBOL] = true;
    OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
    IS_STACK_SYMBOL = "@@__IMMUTABLE_STACK__@@";
    Stack = /* @__PURE__ */ function(IndexedCollection2) {
      function Stack2(value) {
        return value === void 0 || value === null ? emptyStack() : isStack(value) ? value : emptyStack().pushAll(value);
      }
      if (IndexedCollection2) Stack2.__proto__ = IndexedCollection2;
      Stack2.prototype = Object.create(IndexedCollection2 && IndexedCollection2.prototype);
      Stack2.prototype.constructor = Stack2;
      Stack2.of = function of8() {
        return this(arguments);
      };
      Stack2.prototype.toString = function toString5() {
        return this.__toString("Stack [", "]");
      };
      Stack2.prototype.get = function get16(index, notSetValue) {
        var head = this._head;
        index = wrapIndex(this, index);
        while (head && index--) {
          head = head.next;
        }
        return head ? head.value : notSetValue;
      };
      Stack2.prototype.peek = function peek() {
        return this._head && this._head.value;
      };
      Stack2.prototype.push = function push3() {
        var arguments$1 = arguments;
        if (arguments.length === 0) {
          return this;
        }
        var newSize = this.size + arguments.length;
        var head = this._head;
        for (var ii = arguments.length - 1; ii >= 0; ii--) {
          head = {
            value: arguments$1[ii],
            next: head
          };
        }
        if (this.__ownerID) {
          this.size = newSize;
          this._head = head;
          this.__hash = void 0;
          this.__altered = true;
          return this;
        }
        return makeStack(newSize, head);
      };
      Stack2.prototype.pushAll = function pushAll(iter) {
        iter = IndexedCollection2(iter);
        if (iter.size === 0) {
          return this;
        }
        if (this.size === 0 && isStack(iter)) {
          return iter;
        }
        assertNotInfinite(iter.size);
        var newSize = this.size;
        var head = this._head;
        iter.__iterate(
          function(value) {
            newSize++;
            head = {
              value,
              next: head
            };
          },
          /* reverse */
          true
        );
        if (this.__ownerID) {
          this.size = newSize;
          this._head = head;
          this.__hash = void 0;
          this.__altered = true;
          return this;
        }
        return makeStack(newSize, head);
      };
      Stack2.prototype.pop = function pop3() {
        return this.slice(1);
      };
      Stack2.prototype.clear = function clear3() {
        if (this.size === 0) {
          return this;
        }
        if (this.__ownerID) {
          this.size = 0;
          this._head = void 0;
          this.__hash = void 0;
          this.__altered = true;
          return this;
        }
        return emptyStack();
      };
      Stack2.prototype.slice = function slice3(begin, end) {
        if (wholeSlice(begin, end, this.size)) {
          return this;
        }
        var resolvedBegin = resolveBegin(begin, this.size);
        var resolvedEnd = resolveEnd(end, this.size);
        if (resolvedEnd !== this.size) {
          return IndexedCollection2.prototype.slice.call(this, begin, end);
        }
        var newSize = this.size - resolvedBegin;
        var head = this._head;
        while (resolvedBegin--) {
          head = head.next;
        }
        if (this.__ownerID) {
          this.size = newSize;
          this._head = head;
          this.__hash = void 0;
          this.__altered = true;
          return this;
        }
        return makeStack(newSize, head);
      };
      Stack2.prototype.__ensureOwner = function __ensureOwner2(ownerID) {
        if (ownerID === this.__ownerID) {
          return this;
        }
        if (!ownerID) {
          if (this.size === 0) {
            return emptyStack();
          }
          this.__ownerID = ownerID;
          this.__altered = false;
          return this;
        }
        return makeStack(this.size, this._head, ownerID, this.__hash);
      };
      Stack2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        if (reverse6) {
          return new ArraySeq(this.toArray()).__iterate(function(v, k) {
            return fn(v, k, this$1$1);
          }, reverse6);
        }
        var iterations = 0;
        var node = this._head;
        while (node) {
          if (fn(node.value, iterations++, this) === false) {
            break;
          }
          node = node.next;
        }
        return iterations;
      };
      Stack2.prototype.__iterator = function __iterator2(type, reverse6) {
        if (reverse6) {
          return new ArraySeq(this.toArray()).__iterator(type, reverse6);
        }
        var iterations = 0;
        var node = this._head;
        return new Iterator(function() {
          if (node) {
            var value = node.value;
            node = node.next;
            return iteratorValue(type, iterations++, value);
          }
          return iteratorDone();
        });
      };
      return Stack2;
    }(IndexedCollection);
    Stack.isStack = isStack;
    StackPrototype = Stack.prototype;
    StackPrototype[IS_STACK_SYMBOL] = true;
    StackPrototype.shift = StackPrototype.pop;
    StackPrototype.unshift = StackPrototype.push;
    StackPrototype.unshiftAll = StackPrototype.pushAll;
    StackPrototype.withMutations = withMutations;
    StackPrototype.wasAltered = wasAltered;
    StackPrototype.asImmutable = asImmutable;
    StackPrototype["@@transducer/init"] = StackPrototype.asMutable = asMutable;
    StackPrototype["@@transducer/step"] = function(result, arr) {
      return result.unshift(arr);
    };
    StackPrototype["@@transducer/result"] = function(obj) {
      return obj.asImmutable();
    };
    IS_SET_SYMBOL = "@@__IMMUTABLE_SET__@@";
    Range = /* @__PURE__ */ function(IndexedSeq2) {
      function Range2(start, end, step) {
        if (step === void 0) step = 1;
        if (!(this instanceof Range2)) {
          return new Range2(start, end, step);
        }
        invariant(step !== 0, "Cannot step a Range by 0");
        invariant(start !== void 0, "You must define a start value when using Range");
        invariant(end !== void 0, "You must define an end value when using Range");
        step = Math.abs(step);
        if (end < start) {
          step = -step;
        }
        this._start = start;
        this._end = end;
        this._step = step;
        this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
        if (this.size === 0) {
          if (EMPTY_RANGE) {
            return EMPTY_RANGE;
          }
          EMPTY_RANGE = this;
        }
      }
      if (IndexedSeq2) Range2.__proto__ = IndexedSeq2;
      Range2.prototype = Object.create(IndexedSeq2 && IndexedSeq2.prototype);
      Range2.prototype.constructor = Range2;
      Range2.prototype.toString = function toString5() {
        return this.size === 0 ? "Range []" : "Range [ " + this._start + "..." + this._end + (this._step !== 1 ? " by " + this._step : "") + " ]";
      };
      Range2.prototype.get = function get16(index, notSetValue) {
        return this.has(index) ? this._start + wrapIndex(this, index) * this._step : notSetValue;
      };
      Range2.prototype.includes = function includes3(searchValue) {
        var possibleIndex = (searchValue - this._start) / this._step;
        return possibleIndex >= 0 && possibleIndex < this.size && possibleIndex === Math.floor(possibleIndex);
      };
      Range2.prototype.slice = function slice3(begin, end) {
        if (wholeSlice(begin, end, this.size)) {
          return this;
        }
        begin = resolveBegin(begin, this.size);
        end = resolveEnd(end, this.size);
        if (end <= begin) {
          return new Range2(0, 0);
        }
        return new Range2(this.get(begin, this._end), this.get(end, this._end), this._step);
      };
      Range2.prototype.indexOf = function indexOf5(searchValue) {
        var offsetValue = searchValue - this._start;
        if (offsetValue % this._step === 0) {
          var index = offsetValue / this._step;
          if (index >= 0 && index < this.size) {
            return index;
          }
        }
        return -1;
      };
      Range2.prototype.lastIndexOf = function lastIndexOf2(searchValue) {
        return this.indexOf(searchValue);
      };
      Range2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var size = this.size;
        var step = this._step;
        var value = reverse6 ? this._start + (size - 1) * step : this._start;
        var i = 0;
        while (i !== size) {
          if (fn(value, reverse6 ? size - ++i : i++, this) === false) {
            break;
          }
          value += reverse6 ? -step : step;
        }
        return i;
      };
      Range2.prototype.__iterator = function __iterator2(type, reverse6) {
        var size = this.size;
        var step = this._step;
        var value = reverse6 ? this._start + (size - 1) * step : this._start;
        var i = 0;
        return new Iterator(function() {
          if (i === size) {
            return iteratorDone();
          }
          var v = value;
          value += reverse6 ? -step : step;
          return iteratorValue(type, reverse6 ? size - ++i : i++, v);
        });
      };
      Range2.prototype.equals = function equals4(other2) {
        return other2 instanceof Range2 ? this._start === other2._start && this._end === other2._end && this._step === other2._step : deepEqual(this, other2);
      };
      return Range2;
    }(IndexedSeq);
    Set2 = /* @__PURE__ */ function(SetCollection2) {
      function Set3(value) {
        return value === void 0 || value === null ? emptySet() : isSet(value) && !isOrdered(value) ? value : emptySet().withMutations(function(set7) {
          var iter = SetCollection2(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v) {
            return set7.add(v);
          });
        });
      }
      if (SetCollection2) Set3.__proto__ = SetCollection2;
      Set3.prototype = Object.create(SetCollection2 && SetCollection2.prototype);
      Set3.prototype.constructor = Set3;
      Set3.of = function of8() {
        return this(arguments);
      };
      Set3.fromKeys = function fromKeys(value) {
        return this(KeyedCollection(value).keySeq());
      };
      Set3.intersect = function intersect(sets) {
        sets = Collection(sets).toArray();
        return sets.length ? SetPrototype.intersect.apply(Set3(sets.pop()), sets) : emptySet();
      };
      Set3.union = function union(sets) {
        sets = Collection(sets).toArray();
        return sets.length ? SetPrototype.union.apply(Set3(sets.pop()), sets) : emptySet();
      };
      Set3.prototype.toString = function toString5() {
        return this.__toString("Set {", "}");
      };
      Set3.prototype.has = function has10(value) {
        return this._map.has(value);
      };
      Set3.prototype.add = function add2(value) {
        return updateSet(this, this._map.set(value, value));
      };
      Set3.prototype.remove = function remove7(value) {
        return updateSet(this, this._map.remove(value));
      };
      Set3.prototype.clear = function clear3() {
        return updateSet(this, this._map.clear());
      };
      Set3.prototype.map = function map4(mapper, context) {
        var this$1$1 = this;
        var didChanges = false;
        var newMap = updateSet(this, this._map.mapEntries(function(ref) {
          var v = ref[1];
          var mapped = mapper.call(context, v, v, this$1$1);
          if (mapped !== v) {
            didChanges = true;
          }
          return [
            mapped,
            mapped
          ];
        }, context));
        return didChanges ? newMap : this;
      };
      Set3.prototype.union = function union() {
        var iters = [], len6 = arguments.length;
        while (len6--) iters[len6] = arguments[len6];
        iters = iters.filter(function(x) {
          return x.size !== 0;
        });
        if (iters.length === 0) {
          return this;
        }
        if (this.size === 0 && !this.__ownerID && iters.length === 1) {
          return this.constructor(iters[0]);
        }
        return this.withMutations(function(set7) {
          for (var ii = 0; ii < iters.length; ii++) {
            if (typeof iters[ii] === "string") {
              set7.add(iters[ii]);
            } else {
              SetCollection2(iters[ii]).forEach(function(value) {
                return set7.add(value);
              });
            }
          }
        });
      };
      Set3.prototype.intersect = function intersect() {
        var iters = [], len6 = arguments.length;
        while (len6--) iters[len6] = arguments[len6];
        if (iters.length === 0) {
          return this;
        }
        iters = iters.map(function(iter) {
          return SetCollection2(iter);
        });
        var toRemove = [];
        this.forEach(function(value) {
          if (!iters.every(function(iter) {
            return iter.includes(value);
          })) {
            toRemove.push(value);
          }
        });
        return this.withMutations(function(set7) {
          toRemove.forEach(function(value) {
            set7.remove(value);
          });
        });
      };
      Set3.prototype.subtract = function subtract() {
        var iters = [], len6 = arguments.length;
        while (len6--) iters[len6] = arguments[len6];
        if (iters.length === 0) {
          return this;
        }
        iters = iters.map(function(iter) {
          return SetCollection2(iter);
        });
        var toRemove = [];
        this.forEach(function(value) {
          if (iters.some(function(iter) {
            return iter.includes(value);
          })) {
            toRemove.push(value);
          }
        });
        return this.withMutations(function(set7) {
          toRemove.forEach(function(value) {
            set7.remove(value);
          });
        });
      };
      Set3.prototype.sort = function sort3(comparator) {
        return OrderedSet(sortFactory(this, comparator));
      };
      Set3.prototype.sortBy = function sortBy4(mapper, comparator) {
        return OrderedSet(sortFactory(this, comparator, mapper));
      };
      Set3.prototype.wasAltered = function wasAltered3() {
        return this._map.wasAltered();
      };
      Set3.prototype.__iterate = function __iterate2(fn, reverse6) {
        var this$1$1 = this;
        return this._map.__iterate(function(k) {
          return fn(k, k, this$1$1);
        }, reverse6);
      };
      Set3.prototype.__iterator = function __iterator2(type, reverse6) {
        return this._map.__iterator(type, reverse6);
      };
      Set3.prototype.__ensureOwner = function __ensureOwner2(ownerID) {
        if (ownerID === this.__ownerID) {
          return this;
        }
        var newMap = this._map.__ensureOwner(ownerID);
        if (!ownerID) {
          if (this.size === 0) {
            return this.__empty();
          }
          this.__ownerID = ownerID;
          this._map = newMap;
          return this;
        }
        return this.__make(newMap, ownerID);
      };
      return Set3;
    }(SetCollection);
    Set2.isSet = isSet;
    SetPrototype = Set2.prototype;
    SetPrototype[IS_SET_SYMBOL] = true;
    SetPrototype[DELETE] = SetPrototype.remove;
    SetPrototype.merge = SetPrototype.concat = SetPrototype.union;
    SetPrototype.withMutations = withMutations;
    SetPrototype.asImmutable = asImmutable;
    SetPrototype["@@transducer/init"] = SetPrototype.asMutable = asMutable;
    SetPrototype["@@transducer/step"] = function(result, arr) {
      return result.add(arr);
    };
    SetPrototype["@@transducer/result"] = function(obj) {
      return obj.asImmutable();
    };
    SetPrototype.__empty = emptySet;
    SetPrototype.__make = makeSet;
    Collection.Iterator = Iterator;
    mixin(Collection, {
      // ### Conversion to other types
      toArray: function toArray() {
        assertNotInfinite(this.size);
        var array = new Array(this.size || 0);
        var useTuples = isKeyed(this);
        var i = 0;
        this.__iterate(function(v, k) {
          array[i++] = useTuples ? [
            k,
            v
          ] : v;
        });
        return array;
      },
      toIndexedSeq: function toIndexedSeq() {
        return new ToIndexedSequence(this);
      },
      toJS: function toJS$1() {
        return toJS(this);
      },
      toKeyedSeq: function toKeyedSeq() {
        return new ToKeyedSequence(this, true);
      },
      toMap: function toMap() {
        return Map2(this.toKeyedSeq());
      },
      toObject,
      toOrderedMap: function toOrderedMap() {
        return OrderedMap(this.toKeyedSeq());
      },
      toOrderedSet: function toOrderedSet() {
        return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
      },
      toSet: function toSet() {
        return Set2(isKeyed(this) ? this.valueSeq() : this);
      },
      toSetSeq: function toSetSeq() {
        return new ToSetSequence(this);
      },
      toSeq: function toSeq() {
        return isIndexed(this) ? this.toIndexedSeq() : isKeyed(this) ? this.toKeyedSeq() : this.toSetSeq();
      },
      toStack: function toStack() {
        return Stack(isKeyed(this) ? this.valueSeq() : this);
      },
      toList: function toList() {
        return List(isKeyed(this) ? this.valueSeq() : this);
      },
      // ### Common JavaScript methods and properties
      toString: function toString3() {
        return "[Collection]";
      },
      __toString: function __toString(head, tail) {
        if (this.size === 0) {
          return head + tail;
        }
        return head + " " + this.toSeq().map(this.__toStringMapper).join(", ") + " " + tail;
      },
      // ### ES6 Collection methods (ES6 Array and Map)
      concat: function concat() {
        var values3 = [], len6 = arguments.length;
        while (len6--) values3[len6] = arguments[len6];
        return reify(this, concatFactory(this, values3));
      },
      includes: function includes(searchValue) {
        return this.some(function(value) {
          return is(value, searchValue);
        });
      },
      entries: function entries() {
        return this.__iterator(ITERATE_ENTRIES);
      },
      every: function every(predicate, context) {
        assertNotInfinite(this.size);
        var returnValue = true;
        this.__iterate(function(v, k, c) {
          if (!predicate.call(context, v, k, c)) {
            returnValue = false;
            return false;
          }
        });
        return returnValue;
      },
      filter: function filter(predicate, context) {
        return reify(this, filterFactory(this, predicate, context, true));
      },
      partition: function partition(predicate, context) {
        return partitionFactory(this, predicate, context);
      },
      find: function find(predicate, context, notSetValue) {
        var entry = this.findEntry(predicate, context);
        return entry ? entry[1] : notSetValue;
      },
      forEach: function forEach(sideEffect, context) {
        assertNotInfinite(this.size);
        return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
      },
      join: function join(separator) {
        assertNotInfinite(this.size);
        separator = separator !== void 0 ? "" + separator : ",";
        var joined = "";
        var isFirst = true;
        this.__iterate(function(v) {
          isFirst ? isFirst = false : joined += separator;
          joined += v !== null && v !== void 0 ? v.toString() : "";
        });
        return joined;
      },
      keys: function keys() {
        return this.__iterator(ITERATE_KEYS);
      },
      map: function map(mapper, context) {
        return reify(this, mapFactory(this, mapper, context));
      },
      reduce: function reduce$1(reducer, initialReduction, context) {
        return reduce(this, reducer, initialReduction, context, arguments.length < 2, false);
      },
      reduceRight: function reduceRight(reducer, initialReduction, context) {
        return reduce(this, reducer, initialReduction, context, arguments.length < 2, true);
      },
      reverse: function reverse() {
        return reify(this, reverseFactory(this, true));
      },
      slice: function slice(begin, end) {
        return reify(this, sliceFactory(this, begin, end, true));
      },
      some: function some(predicate, context) {
        assertNotInfinite(this.size);
        var returnValue = false;
        this.__iterate(function(v, k, c) {
          if (predicate.call(context, v, k, c)) {
            returnValue = true;
            return false;
          }
        });
        return returnValue;
      },
      sort: function sort(comparator) {
        return reify(this, sortFactory(this, comparator));
      },
      values: function values() {
        return this.__iterator(ITERATE_VALUES);
      },
      // ### More sequential methods
      butLast: function butLast() {
        return this.slice(0, -1);
      },
      isEmpty: function isEmpty() {
        return this.size !== void 0 ? this.size === 0 : !this.some(function() {
          return true;
        });
      },
      count: function count(predicate, context) {
        return ensureSize(predicate ? this.toSeq().filter(predicate, context) : this);
      },
      countBy: function countBy(grouper, context) {
        return countByFactory(this, grouper, context);
      },
      equals: function equals(other2) {
        return deepEqual(this, other2);
      },
      entrySeq: function entrySeq() {
        var collection = this;
        if (collection._cache) {
          return new ArraySeq(collection._cache);
        }
        var entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
        entriesSequence.fromEntrySeq = function() {
          return collection.toSeq();
        };
        return entriesSequence;
      },
      filterNot: function filterNot(predicate, context) {
        return this.filter(not(predicate), context);
      },
      findEntry: function findEntry(predicate, context, notSetValue) {
        var found = notSetValue;
        this.__iterate(function(v, k, c) {
          if (predicate.call(context, v, k, c)) {
            found = [
              k,
              v
            ];
            return false;
          }
        });
        return found;
      },
      findKey: function findKey(predicate, context) {
        var entry = this.findEntry(predicate, context);
        return entry && entry[0];
      },
      findLast: function findLast(predicate, context, notSetValue) {
        return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
      },
      findLastEntry: function findLastEntry(predicate, context, notSetValue) {
        return this.toKeyedSeq().reverse().findEntry(predicate, context, notSetValue);
      },
      findLastKey: function findLastKey(predicate, context) {
        return this.toKeyedSeq().reverse().findKey(predicate, context);
      },
      first: function first(notSetValue) {
        return this.find(returnTrue, null, notSetValue);
      },
      flatMap: function flatMap(mapper, context) {
        return reify(this, flatMapFactory(this, mapper, context));
      },
      flatten: function flatten(depth) {
        return reify(this, flattenFactory(this, depth, true));
      },
      fromEntrySeq: function fromEntrySeq() {
        return new FromEntriesSequence(this);
      },
      get: function get7(searchKey, notSetValue) {
        return this.find(function(_, key) {
          return is(key, searchKey);
        }, void 0, notSetValue);
      },
      getIn,
      groupBy: function groupBy(grouper, context) {
        return groupByFactory(this, grouper, context);
      },
      has: function has2(searchKey) {
        return this.get(searchKey, NOT_SET) !== NOT_SET;
      },
      hasIn,
      isSubset: function isSubset(iter) {
        iter = typeof iter.includes === "function" ? iter : Collection(iter);
        return this.every(function(value) {
          return iter.includes(value);
        });
      },
      isSuperset: function isSuperset(iter) {
        iter = typeof iter.isSubset === "function" ? iter : Collection(iter);
        return iter.isSubset(this);
      },
      keyOf: function keyOf(searchValue) {
        return this.findKey(function(value) {
          return is(value, searchValue);
        });
      },
      keySeq: function keySeq() {
        return this.toSeq().map(keyMapper).toIndexedSeq();
      },
      last: function last(notSetValue) {
        return this.toSeq().reverse().first(notSetValue);
      },
      lastKeyOf: function lastKeyOf(searchValue) {
        return this.toKeyedSeq().reverse().keyOf(searchValue);
      },
      max: function max(comparator) {
        return maxFactory(this, comparator);
      },
      maxBy: function maxBy(mapper, comparator) {
        return maxFactory(this, comparator, mapper);
      },
      min: function min(comparator) {
        return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
      },
      minBy: function minBy(mapper, comparator) {
        return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
      },
      rest: function rest() {
        return this.slice(1);
      },
      skip: function skip(amount) {
        return amount === 0 ? this : this.slice(Math.max(0, amount));
      },
      skipLast: function skipLast(amount) {
        return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
      },
      skipWhile: function skipWhile(predicate, context) {
        return reify(this, skipWhileFactory(this, predicate, context, true));
      },
      skipUntil: function skipUntil(predicate, context) {
        return this.skipWhile(not(predicate), context);
      },
      sortBy: function sortBy(mapper, comparator) {
        return reify(this, sortFactory(this, comparator, mapper));
      },
      take: function take(amount) {
        return this.slice(0, Math.max(0, amount));
      },
      takeLast: function takeLast(amount) {
        return this.slice(-Math.max(0, amount));
      },
      takeWhile: function takeWhile(predicate, context) {
        return reify(this, takeWhileFactory(this, predicate, context));
      },
      takeUntil: function takeUntil(predicate, context) {
        return this.takeWhile(not(predicate), context);
      },
      update: function update7(fn) {
        return fn(this);
      },
      valueSeq: function valueSeq() {
        return this.toIndexedSeq();
      },
      // ### Hashable Object
      hashCode: function hashCode() {
        return this.__hash || (this.__hash = hashCollection(this));
      }
    });
    CollectionPrototype = Collection.prototype;
    CollectionPrototype[IS_COLLECTION_SYMBOL] = true;
    CollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.values;
    CollectionPrototype.toJSON = CollectionPrototype.toArray;
    CollectionPrototype.__toStringMapper = quoteString;
    CollectionPrototype.inspect = CollectionPrototype.toSource = function() {
      return this.toString();
    };
    CollectionPrototype.chain = CollectionPrototype.flatMap;
    CollectionPrototype.contains = CollectionPrototype.includes;
    mixin(KeyedCollection, {
      // ### More sequential methods
      flip: function flip() {
        return reify(this, flipFactory(this));
      },
      mapEntries: function mapEntries(mapper, context) {
        var this$1$1 = this;
        var iterations = 0;
        return reify(this, this.toSeq().map(function(v, k) {
          return mapper.call(context, [
            k,
            v
          ], iterations++, this$1$1);
        }).fromEntrySeq());
      },
      mapKeys: function mapKeys(mapper, context) {
        var this$1$1 = this;
        return reify(this, this.toSeq().flip().map(function(k, v) {
          return mapper.call(context, k, v, this$1$1);
        }).flip());
      }
    });
    KeyedCollectionPrototype = KeyedCollection.prototype;
    KeyedCollectionPrototype[IS_KEYED_SYMBOL] = true;
    KeyedCollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.entries;
    KeyedCollectionPrototype.toJSON = toObject;
    KeyedCollectionPrototype.__toStringMapper = function(v, k) {
      return quoteString(k) + ": " + quoteString(v);
    };
    mixin(IndexedCollection, {
      // ### Conversion to other types
      toKeyedSeq: function toKeyedSeq2() {
        return new ToKeyedSequence(this, false);
      },
      // ### ES6 Collection methods (ES6 Array and Map)
      filter: function filter2(predicate, context) {
        return reify(this, filterFactory(this, predicate, context, false));
      },
      findIndex: function findIndex(predicate, context) {
        var entry = this.findEntry(predicate, context);
        return entry ? entry[0] : -1;
      },
      indexOf: function indexOf(searchValue) {
        var key = this.keyOf(searchValue);
        return key === void 0 ? -1 : key;
      },
      lastIndexOf: function lastIndexOf(searchValue) {
        var key = this.lastKeyOf(searchValue);
        return key === void 0 ? -1 : key;
      },
      reverse: function reverse2() {
        return reify(this, reverseFactory(this, false));
      },
      slice: function slice2(begin, end) {
        return reify(this, sliceFactory(this, begin, end, false));
      },
      splice: function splice(index, removeNum) {
        var numArgs = arguments.length;
        removeNum = Math.max(removeNum || 0, 0);
        if (numArgs === 0 || numArgs === 2 && !removeNum) {
          return this;
        }
        index = resolveBegin(index, index < 0 ? this.count() : this.size);
        var spliced = this.slice(0, index);
        return reify(this, numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum)));
      },
      // ### More collection methods
      findLastIndex: function findLastIndex(predicate, context) {
        var entry = this.findLastEntry(predicate, context);
        return entry ? entry[0] : -1;
      },
      first: function first2(notSetValue) {
        return this.get(0, notSetValue);
      },
      flatten: function flatten2(depth) {
        return reify(this, flattenFactory(this, depth, false));
      },
      get: function get8(index, notSetValue) {
        index = wrapIndex(this, index);
        return index < 0 || this.size === Infinity || this.size !== void 0 && index > this.size ? notSetValue : this.find(function(_, key) {
          return key === index;
        }, void 0, notSetValue);
      },
      has: function has3(index) {
        index = wrapIndex(this, index);
        return index >= 0 && (this.size !== void 0 ? this.size === Infinity || index < this.size : this.indexOf(index) !== -1);
      },
      interpose: function interpose(separator) {
        return reify(this, interposeFactory(this, separator));
      },
      interleave: function interleave() {
        var collections = [
          this
        ].concat(arrCopy(arguments));
        var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, collections);
        var interleaved = zipped.flatten(true);
        if (zipped.size) {
          interleaved.size = zipped.size * collections.length;
        }
        return reify(this, interleaved);
      },
      keySeq: function keySeq2() {
        return Range(0, this.size);
      },
      last: function last2(notSetValue) {
        return this.get(-1, notSetValue);
      },
      skipWhile: function skipWhile2(predicate, context) {
        return reify(this, skipWhileFactory(this, predicate, context, false));
      },
      zip: function zip() {
        var collections = [
          this
        ].concat(arrCopy(arguments));
        return reify(this, zipWithFactory(this, defaultZipper, collections));
      },
      zipAll: function zipAll() {
        var collections = [
          this
        ].concat(arrCopy(arguments));
        return reify(this, zipWithFactory(this, defaultZipper, collections, true));
      },
      zipWith: function zipWith(zipper) {
        var collections = arrCopy(arguments);
        collections[0] = this;
        return reify(this, zipWithFactory(this, zipper, collections));
      }
    });
    IndexedCollectionPrototype = IndexedCollection.prototype;
    IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
    IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;
    mixin(SetCollection, {
      // ### ES6 Collection methods (ES6 Array and Map)
      get: function get9(value, notSetValue) {
        return this.has(value) ? value : notSetValue;
      },
      includes: function includes2(value) {
        return this.has(value);
      },
      // ### More sequential methods
      keySeq: function keySeq3() {
        return this.valueSeq();
      }
    });
    SetCollectionPrototype = SetCollection.prototype;
    SetCollectionPrototype.has = CollectionPrototype.includes;
    SetCollectionPrototype.contains = SetCollectionPrototype.includes;
    SetCollectionPrototype.keys = SetCollectionPrototype.values;
    mixin(KeyedSeq, KeyedCollectionPrototype);
    mixin(IndexedSeq, IndexedCollectionPrototype);
    mixin(SetSeq, SetCollectionPrototype);
    OrderedSet = /* @__PURE__ */ function(Set3) {
      function OrderedSet2(value) {
        return value === void 0 || value === null ? emptyOrderedSet() : isOrderedSet(value) ? value : emptyOrderedSet().withMutations(function(set7) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v) {
            return set7.add(v);
          });
        });
      }
      if (Set3) OrderedSet2.__proto__ = Set3;
      OrderedSet2.prototype = Object.create(Set3 && Set3.prototype);
      OrderedSet2.prototype.constructor = OrderedSet2;
      OrderedSet2.of = function of8() {
        return this(arguments);
      };
      OrderedSet2.fromKeys = function fromKeys(value) {
        return this(KeyedCollection(value).keySeq());
      };
      OrderedSet2.prototype.toString = function toString5() {
        return this.__toString("OrderedSet {", "}");
      };
      return OrderedSet2;
    }(Set2);
    OrderedSet.isOrderedSet = isOrderedSet;
    OrderedSetPrototype = OrderedSet.prototype;
    OrderedSetPrototype[IS_ORDERED_SYMBOL] = true;
    OrderedSetPrototype.zip = IndexedCollectionPrototype.zip;
    OrderedSetPrototype.zipWith = IndexedCollectionPrototype.zipWith;
    OrderedSetPrototype.zipAll = IndexedCollectionPrototype.zipAll;
    OrderedSetPrototype.__empty = emptyOrderedSet;
    OrderedSetPrototype.__make = makeOrderedSet;
    PairSorting = {
      LeftThenRight: -1,
      RightThenLeft: 1
    };
    Record = function Record2(defaultValues, name) {
      var hasInitialized;
      throwOnInvalidDefaultValues(defaultValues);
      var RecordType = function Record3(values3) {
        var this$1$1 = this;
        if (values3 instanceof RecordType) {
          return values3;
        }
        if (!(this instanceof RecordType)) {
          return new RecordType(values3);
        }
        if (!hasInitialized) {
          hasInitialized = true;
          var keys3 = Object.keys(defaultValues);
          var indices = RecordTypePrototype._indices = {};
          RecordTypePrototype._name = name;
          RecordTypePrototype._keys = keys3;
          RecordTypePrototype._defaultValues = defaultValues;
          for (var i = 0; i < keys3.length; i++) {
            var propName = keys3[i];
            indices[propName] = i;
            if (RecordTypePrototype[propName]) {
              typeof console === "object" && console.warn && console.warn("Cannot define " + recordName(this) + ' with property "' + propName + '" since that property name is part of the Record API.');
            } else {
              setProp(RecordTypePrototype, propName);
            }
          }
        }
        this.__ownerID = void 0;
        this._values = List().withMutations(function(l) {
          l.setSize(this$1$1._keys.length);
          KeyedCollection(values3).forEach(function(v, k) {
            l.set(this$1$1._indices[k], v === this$1$1._defaultValues[k] ? void 0 : v);
          });
        });
        return this;
      };
      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;
      if (name) {
        RecordType.displayName = name;
      }
      return RecordType;
    };
    Record.prototype.toString = function toString4() {
      var str = recordName(this) + " { ";
      var keys3 = this._keys;
      var k;
      for (var i = 0, l = keys3.length; i !== l; i++) {
        k = keys3[i];
        str += (i ? ", " : "") + k + ": " + quoteString(this.get(k));
      }
      return str + " }";
    };
    Record.prototype.equals = function equals2(other2) {
      return this === other2 || isRecord(other2) && recordSeq(this).equals(recordSeq(other2));
    };
    Record.prototype.hashCode = function hashCode2() {
      return recordSeq(this).hashCode();
    };
    Record.prototype.has = function has4(k) {
      return this._indices.hasOwnProperty(k);
    };
    Record.prototype.get = function get10(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var index = this._indices[k];
      var value = this._values.get(index);
      return value === void 0 ? this._defaultValues[k] : value;
    };
    Record.prototype.set = function set2(k, v) {
      if (this.has(k)) {
        var newValues = this._values.set(this._indices[k], v === this._defaultValues[k] ? void 0 : v);
        if (newValues !== this._values && !this.__ownerID) {
          return makeRecord(this, newValues);
        }
      }
      return this;
    };
    Record.prototype.remove = function remove2(k) {
      return this.set(k);
    };
    Record.prototype.clear = function clear() {
      var newValues = this._values.clear().setSize(this._keys.length);
      return this.__ownerID ? this : makeRecord(this, newValues);
    };
    Record.prototype.wasAltered = function wasAltered2() {
      return this._values.wasAltered();
    };
    Record.prototype.toSeq = function toSeq2() {
      return recordSeq(this);
    };
    Record.prototype.toJS = function toJS$12() {
      return toJS(this);
    };
    Record.prototype.entries = function entries2() {
      return this.__iterator(ITERATE_ENTRIES);
    };
    Record.prototype.__iterator = function __iterator(type, reverse6) {
      return recordSeq(this).__iterator(type, reverse6);
    };
    Record.prototype.__iterate = function __iterate(fn, reverse6) {
      return recordSeq(this).__iterate(fn, reverse6);
    };
    Record.prototype.__ensureOwner = function __ensureOwner(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newValues = this._values.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._values = newValues;
        return this;
      }
      return makeRecord(this, newValues, ownerID);
    };
    Record.isRecord = isRecord;
    Record.getDescriptiveName = recordName;
    RecordPrototype = Record.prototype;
    RecordPrototype[IS_RECORD_SYMBOL] = true;
    RecordPrototype[DELETE] = RecordPrototype.remove;
    RecordPrototype.deleteIn = RecordPrototype.removeIn = deleteIn;
    RecordPrototype.getIn = getIn;
    RecordPrototype.hasIn = CollectionPrototype.hasIn;
    RecordPrototype.merge = merge$1;
    RecordPrototype.mergeWith = mergeWith$1;
    RecordPrototype.mergeIn = mergeIn;
    RecordPrototype.mergeDeep = mergeDeep;
    RecordPrototype.mergeDeepWith = mergeDeepWith;
    RecordPrototype.mergeDeepIn = mergeDeepIn;
    RecordPrototype.setIn = setIn;
    RecordPrototype.update = update;
    RecordPrototype.updateIn = updateIn$1;
    RecordPrototype.withMutations = withMutations;
    RecordPrototype.asMutable = asMutable;
    RecordPrototype.asImmutable = asImmutable;
    RecordPrototype[ITERATOR_SYMBOL] = RecordPrototype.entries;
    RecordPrototype.toJSON = RecordPrototype.toObject = CollectionPrototype.toObject;
    RecordPrototype.inspect = RecordPrototype.toSource = function() {
      return this.toString();
    };
    Repeat = /* @__PURE__ */ function(IndexedSeq2) {
      function Repeat2(value, times) {
        if (!(this instanceof Repeat2)) {
          return new Repeat2(value, times);
        }
        this._value = value;
        this.size = times === void 0 ? Infinity : Math.max(0, times);
        if (this.size === 0) {
          if (EMPTY_REPEAT) {
            return EMPTY_REPEAT;
          }
          EMPTY_REPEAT = this;
        }
      }
      if (IndexedSeq2) Repeat2.__proto__ = IndexedSeq2;
      Repeat2.prototype = Object.create(IndexedSeq2 && IndexedSeq2.prototype);
      Repeat2.prototype.constructor = Repeat2;
      Repeat2.prototype.toString = function toString5() {
        if (this.size === 0) {
          return "Repeat []";
        }
        return "Repeat [ " + this._value + " " + this.size + " times ]";
      };
      Repeat2.prototype.get = function get16(index, notSetValue) {
        return this.has(index) ? this._value : notSetValue;
      };
      Repeat2.prototype.includes = function includes3(searchValue) {
        return is(this._value, searchValue);
      };
      Repeat2.prototype.slice = function slice3(begin, end) {
        var size = this.size;
        return wholeSlice(begin, end, size) ? this : new Repeat2(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
      };
      Repeat2.prototype.reverse = function reverse6() {
        return this;
      };
      Repeat2.prototype.indexOf = function indexOf5(searchValue) {
        if (is(this._value, searchValue)) {
          return 0;
        }
        return -1;
      };
      Repeat2.prototype.lastIndexOf = function lastIndexOf2(searchValue) {
        if (is(this._value, searchValue)) {
          return this.size;
        }
        return -1;
      };
      Repeat2.prototype.__iterate = function __iterate2(fn, reverse6) {
        var size = this.size;
        var i = 0;
        while (i !== size) {
          if (fn(this._value, reverse6 ? size - ++i : i++, this) === false) {
            break;
          }
        }
        return i;
      };
      Repeat2.prototype.__iterator = function __iterator2(type, reverse6) {
        var this$1$1 = this;
        var size = this.size;
        var i = 0;
        return new Iterator(function() {
          return i === size ? iteratorDone() : iteratorValue(type, reverse6 ? size - ++i : i++, this$1$1._value);
        });
      };
      Repeat2.prototype.equals = function equals4(other2) {
        return other2 instanceof Repeat2 ? is(this._value, other2._value) : deepEqual(this, other2);
      };
      return Repeat2;
    }(IndexedSeq);
    version = "5.1.3";
    Iterable = Collection;
    immutable_default = {
      Collection,
      Iterable,
      List,
      Map: Map2,
      OrderedMap,
      OrderedSet,
      PairSorting,
      Range,
      Record,
      Repeat,
      Seq,
      Set: Set2,
      Stack,
      fromJS,
      get: get6,
      getIn: getIn$1,
      has,
      hasIn: hasIn$1,
      hash,
      is,
      isAssociative,
      isCollection,
      isImmutable,
      isIndexed,
      isKeyed,
      isList,
      isMap,
      isOrdered,
      isOrderedMap,
      isOrderedSet,
      isPlainObject,
      isRecord,
      isSeq,
      isSet,
      isStack,
      isValueObject,
      merge,
      mergeDeep: mergeDeep$1,
      mergeDeepWith: mergeDeepWith$1,
      mergeWith,
      remove,
      removeIn,
      set,
      setIn: setIn$1,
      update: update$1,
      updateIn,
      version
    };
  }
});

// src/obj.js
function checkKey(object, key) {
  checkType(object, "object");
  if (!object.has(key)) {
    throw new Panic("key not found", {
      key
    });
  }
  return key;
}
function isMatch(object, matcher) {
  checkType(object, "object");
  checkType(matcher, "object");
  return matchHelper(object, matcher);
}
function matchHelper(value, goal) {
  if (getType(value) !== "object" && getType(goal) !== "object") {
    return immutable_default.is(value, goal);
  }
  return goal.every((v, k) => value.has(k) && matchHelper(value.get(k), v));
}
var init_obj = __esm({
  "src/obj.js"() {
    init_values();
    init_panic();
    init_immutable();
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/CsvError.js
var CsvError;
var init_CsvError = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/CsvError.js"() {
    CsvError = class _CsvError extends Error {
      constructor(code2, message, options3, ...contexts) {
        if (Array.isArray(message)) message = message.join(" ").trim();
        super(message);
        if (Error.captureStackTrace !== void 0) {
          Error.captureStackTrace(this, _CsvError);
        }
        this.code = code2;
        for (const context of contexts) {
          for (const key in context) {
            const value = context[key];
            this[key] = Buffer.isBuffer(value) ? value.toString(options3.encoding) : value == null ? value : JSON.parse(JSON.stringify(value));
          }
        }
      }
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/utils/is_object.js
var is_object;
var init_is_object = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/utils/is_object.js"() {
    is_object = function(obj) {
      return typeof obj === "object" && obj !== null && !Array.isArray(obj);
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/normalize_columns_array.js
var normalize_columns_array;
var init_normalize_columns_array = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/normalize_columns_array.js"() {
    init_CsvError();
    init_is_object();
    normalize_columns_array = function(columns2) {
      const normalizedColumns = [];
      for (let i = 0, l = columns2.length; i < l; i++) {
        const column = columns2[i];
        if (column === void 0 || column === null || column === false) {
          normalizedColumns[i] = {
            disabled: true
          };
        } else if (typeof column === "string") {
          normalizedColumns[i] = {
            name: column
          };
        } else if (is_object(column)) {
          if (typeof column.name !== "string") {
            throw new CsvError("CSV_OPTION_COLUMNS_MISSING_NAME", [
              "Option columns missing name:",
              `property "name" is required at position ${i}`,
              "when column is an object literal"
            ]);
          }
          normalizedColumns[i] = column;
        } else {
          throw new CsvError("CSV_INVALID_COLUMN_DEFINITION", [
            "Invalid column definition:",
            "expect a string or a literal object,",
            `got ${JSON.stringify(column)} at position ${i}`
          ]);
        }
      }
      return normalizedColumns;
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/utils/ResizeableBuffer.js
var ResizeableBuffer, ResizeableBuffer_default;
var init_ResizeableBuffer = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/utils/ResizeableBuffer.js"() {
    ResizeableBuffer = class {
      constructor(size = 100) {
        this.size = size;
        this.length = 0;
        this.buf = Buffer.allocUnsafe(size);
      }
      prepend(val) {
        if (Buffer.isBuffer(val)) {
          const length = this.length + val.length;
          if (length >= this.size) {
            this.resize();
            if (length >= this.size) {
              throw Error("INVALID_BUFFER_STATE");
            }
          }
          const buf = this.buf;
          this.buf = Buffer.allocUnsafe(this.size);
          val.copy(this.buf, 0);
          buf.copy(this.buf, val.length);
          this.length += val.length;
        } else {
          const length = this.length++;
          if (length === this.size) {
            this.resize();
          }
          const buf = this.clone();
          this.buf[0] = val;
          buf.copy(this.buf, 1, 0, length);
        }
      }
      append(val) {
        const length = this.length++;
        if (length === this.size) {
          this.resize();
        }
        this.buf[length] = val;
      }
      clone() {
        return Buffer.from(this.buf.slice(0, this.length));
      }
      resize() {
        const length = this.length;
        this.size = this.size * 2;
        const buf = Buffer.allocUnsafe(this.size);
        this.buf.copy(buf, 0, 0, length);
        this.buf = buf;
      }
      toString(encoding) {
        if (encoding) {
          return this.buf.slice(0, this.length).toString(encoding);
        } else {
          return Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
        }
      }
      toJSON() {
        return this.toString("utf8");
      }
      reset() {
        this.length = 0;
      }
    };
    ResizeableBuffer_default = ResizeableBuffer;
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/init_state.js
var np, cr, nl, space, tab, init_state;
var init_init_state = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/init_state.js"() {
    init_ResizeableBuffer();
    np = 12;
    cr = 13;
    nl = 10;
    space = 32;
    tab = 9;
    init_state = function(options3) {
      return {
        bomSkipped: false,
        bufBytesStart: 0,
        castField: options3.cast_function,
        commenting: false,
        // Current error encountered by a record
        error: void 0,
        enabled: options3.from_line === 1,
        escaping: false,
        escapeIsQuote: Buffer.isBuffer(options3.escape) && Buffer.isBuffer(options3.quote) && Buffer.compare(options3.escape, options3.quote) === 0,
        // columns can be `false`, `true`, `Array`
        expectedRecordLength: Array.isArray(options3.columns) ? options3.columns.length : void 0,
        field: new ResizeableBuffer_default(20),
        firstLineToHeaders: options3.cast_first_line_to_header,
        needMoreDataSize: Math.max(
          // Skip if the remaining buffer smaller than comment
          options3.comment !== null ? options3.comment.length : 0,
          ...options3.delimiter.map((delimiter) => delimiter.length),
          // Skip if the remaining buffer can be escape sequence
          options3.quote !== null ? options3.quote.length : 0
        ),
        previousBuf: void 0,
        quoting: false,
        stop: false,
        rawBuffer: new ResizeableBuffer_default(100),
        record: [],
        recordHasError: false,
        record_length: 0,
        recordDelimiterMaxLength: options3.record_delimiter.length === 0 ? 0 : Math.max(...options3.record_delimiter.map((v) => v.length)),
        trimChars: [
          Buffer.from(" ", options3.encoding)[0],
          Buffer.from("	", options3.encoding)[0]
        ],
        wasQuoting: false,
        wasRowDelimiter: false,
        timchars: [
          Buffer.from(Buffer.from([
            cr
          ], "utf8").toString(), options3.encoding),
          Buffer.from(Buffer.from([
            nl
          ], "utf8").toString(), options3.encoding),
          Buffer.from(Buffer.from([
            np
          ], "utf8").toString(), options3.encoding),
          Buffer.from(Buffer.from([
            space
          ], "utf8").toString(), options3.encoding),
          Buffer.from(Buffer.from([
            tab
          ], "utf8").toString(), options3.encoding)
        ]
      };
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/utils/underscore.js
var underscore;
var init_underscore = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/utils/underscore.js"() {
    underscore = function(str) {
      return str.replace(/([A-Z])/g, function(_, match3) {
        return "_" + match3.toLowerCase();
      });
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/normalize_options.js
var normalize_options;
var init_normalize_options = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/normalize_options.js"() {
    init_normalize_columns_array();
    init_CsvError();
    init_underscore();
    normalize_options = function(opts) {
      const options3 = {};
      for (const opt in opts) {
        options3[underscore(opt)] = opts[opt];
      }
      if (options3.encoding === void 0 || options3.encoding === true) {
        options3.encoding = "utf8";
      } else if (options3.encoding === null || options3.encoding === false) {
        options3.encoding = null;
      } else if (typeof options3.encoding !== "string" && options3.encoding !== null) {
        throw new CsvError("CSV_INVALID_OPTION_ENCODING", [
          "Invalid option encoding:",
          "encoding must be a string or null to return a buffer,",
          `got ${JSON.stringify(options3.encoding)}`
        ], options3);
      }
      if (options3.bom === void 0 || options3.bom === null || options3.bom === false) {
        options3.bom = false;
      } else if (options3.bom !== true) {
        throw new CsvError("CSV_INVALID_OPTION_BOM", [
          "Invalid option bom:",
          "bom must be true,",
          `got ${JSON.stringify(options3.bom)}`
        ], options3);
      }
      options3.cast_function = null;
      if (options3.cast === void 0 || options3.cast === null || options3.cast === false || options3.cast === "") {
        options3.cast = void 0;
      } else if (typeof options3.cast === "function") {
        options3.cast_function = options3.cast;
        options3.cast = true;
      } else if (options3.cast !== true) {
        throw new CsvError("CSV_INVALID_OPTION_CAST", [
          "Invalid option cast:",
          "cast must be true or a function,",
          `got ${JSON.stringify(options3.cast)}`
        ], options3);
      }
      if (options3.cast_date === void 0 || options3.cast_date === null || options3.cast_date === false || options3.cast_date === "") {
        options3.cast_date = false;
      } else if (options3.cast_date === true) {
        options3.cast_date = function(value) {
          const date = Date.parse(value);
          return !isNaN(date) ? new Date(date) : value;
        };
      } else if (typeof options3.cast_date !== "function") {
        throw new CsvError("CSV_INVALID_OPTION_CAST_DATE", [
          "Invalid option cast_date:",
          "cast_date must be true or a function,",
          `got ${JSON.stringify(options3.cast_date)}`
        ], options3);
      }
      options3.cast_first_line_to_header = null;
      if (options3.columns === true) {
        options3.cast_first_line_to_header = void 0;
      } else if (typeof options3.columns === "function") {
        options3.cast_first_line_to_header = options3.columns;
        options3.columns = true;
      } else if (Array.isArray(options3.columns)) {
        options3.columns = normalize_columns_array(options3.columns);
      } else if (options3.columns === void 0 || options3.columns === null || options3.columns === false) {
        options3.columns = false;
      } else {
        throw new CsvError("CSV_INVALID_OPTION_COLUMNS", [
          "Invalid option columns:",
          "expect an array, a function or true,",
          `got ${JSON.stringify(options3.columns)}`
        ], options3);
      }
      if (options3.group_columns_by_name === void 0 || options3.group_columns_by_name === null || options3.group_columns_by_name === false) {
        options3.group_columns_by_name = false;
      } else if (options3.group_columns_by_name !== true) {
        throw new CsvError("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
          "Invalid option group_columns_by_name:",
          "expect an boolean,",
          `got ${JSON.stringify(options3.group_columns_by_name)}`
        ], options3);
      } else if (options3.columns === false) {
        throw new CsvError("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
          "Invalid option group_columns_by_name:",
          "the `columns` mode must be activated."
        ], options3);
      }
      if (options3.comment === void 0 || options3.comment === null || options3.comment === false || options3.comment === "") {
        options3.comment = null;
      } else {
        if (typeof options3.comment === "string") {
          options3.comment = Buffer.from(options3.comment, options3.encoding);
        }
        if (!Buffer.isBuffer(options3.comment)) {
          throw new CsvError("CSV_INVALID_OPTION_COMMENT", [
            "Invalid option comment:",
            "comment must be a buffer or a string,",
            `got ${JSON.stringify(options3.comment)}`
          ], options3);
        }
      }
      if (options3.comment_no_infix === void 0 || options3.comment_no_infix === null || options3.comment_no_infix === false) {
        options3.comment_no_infix = false;
      } else if (options3.comment_no_infix !== true) {
        throw new CsvError("CSV_INVALID_OPTION_COMMENT", [
          "Invalid option comment_no_infix:",
          "value must be a boolean,",
          `got ${JSON.stringify(options3.comment_no_infix)}`
        ], options3);
      }
      const delimiter_json = JSON.stringify(options3.delimiter);
      if (!Array.isArray(options3.delimiter)) options3.delimiter = [
        options3.delimiter
      ];
      if (options3.delimiter.length === 0) {
        throw new CsvError("CSV_INVALID_OPTION_DELIMITER", [
          "Invalid option delimiter:",
          "delimiter must be a non empty string or buffer or array of string|buffer,",
          `got ${delimiter_json}`
        ], options3);
      }
      options3.delimiter = options3.delimiter.map(function(delimiter) {
        if (delimiter === void 0 || delimiter === null || delimiter === false) {
          return Buffer.from(",", options3.encoding);
        }
        if (typeof delimiter === "string") {
          delimiter = Buffer.from(delimiter, options3.encoding);
        }
        if (!Buffer.isBuffer(delimiter) || delimiter.length === 0) {
          throw new CsvError("CSV_INVALID_OPTION_DELIMITER", [
            "Invalid option delimiter:",
            "delimiter must be a non empty string or buffer or array of string|buffer,",
            `got ${delimiter_json}`
          ], options3);
        }
        return delimiter;
      });
      if (options3.escape === void 0 || options3.escape === true) {
        options3.escape = Buffer.from('"', options3.encoding);
      } else if (typeof options3.escape === "string") {
        options3.escape = Buffer.from(options3.escape, options3.encoding);
      } else if (options3.escape === null || options3.escape === false) {
        options3.escape = null;
      }
      if (options3.escape !== null) {
        if (!Buffer.isBuffer(options3.escape)) {
          throw new Error(`Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options3.escape)}`);
        }
      }
      if (options3.from === void 0 || options3.from === null) {
        options3.from = 1;
      } else {
        if (typeof options3.from === "string" && /\d+/.test(options3.from)) {
          options3.from = parseInt(options3.from);
        }
        if (Number.isInteger(options3.from)) {
          if (options3.from < 0) {
            throw new Error(`Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`);
          }
        } else {
          throw new Error(`Invalid Option: from must be an integer, got ${JSON.stringify(options3.from)}`);
        }
      }
      if (options3.from_line === void 0 || options3.from_line === null) {
        options3.from_line = 1;
      } else {
        if (typeof options3.from_line === "string" && /\d+/.test(options3.from_line)) {
          options3.from_line = parseInt(options3.from_line);
        }
        if (Number.isInteger(options3.from_line)) {
          if (options3.from_line <= 0) {
            throw new Error(`Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`);
          }
        } else {
          throw new Error(`Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`);
        }
      }
      if (options3.ignore_last_delimiters === void 0 || options3.ignore_last_delimiters === null) {
        options3.ignore_last_delimiters = false;
      } else if (typeof options3.ignore_last_delimiters === "number") {
        options3.ignore_last_delimiters = Math.floor(options3.ignore_last_delimiters);
        if (options3.ignore_last_delimiters === 0) {
          options3.ignore_last_delimiters = false;
        }
      } else if (typeof options3.ignore_last_delimiters !== "boolean") {
        throw new CsvError("CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS", [
          "Invalid option `ignore_last_delimiters`:",
          "the value must be a boolean value or an integer,",
          `got ${JSON.stringify(options3.ignore_last_delimiters)}`
        ], options3);
      }
      if (options3.ignore_last_delimiters === true && options3.columns === false) {
        throw new CsvError("CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS", [
          "The option `ignore_last_delimiters`",
          "requires the activation of the `columns` option"
        ], options3);
      }
      if (options3.info === void 0 || options3.info === null || options3.info === false) {
        options3.info = false;
      } else if (options3.info !== true) {
        throw new Error(`Invalid Option: info must be true, got ${JSON.stringify(options3.info)}`);
      }
      if (options3.max_record_size === void 0 || options3.max_record_size === null || options3.max_record_size === false) {
        options3.max_record_size = 0;
      } else if (Number.isInteger(options3.max_record_size) && options3.max_record_size >= 0) {
      } else if (typeof options3.max_record_size === "string" && /\d+/.test(options3.max_record_size)) {
        options3.max_record_size = parseInt(options3.max_record_size);
      } else {
        throw new Error(`Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options3.max_record_size)}`);
      }
      if (options3.objname === void 0 || options3.objname === null || options3.objname === false) {
        options3.objname = void 0;
      } else if (Buffer.isBuffer(options3.objname)) {
        if (options3.objname.length === 0) {
          throw new Error(`Invalid Option: objname must be a non empty buffer`);
        }
        if (options3.encoding === null) {
        } else {
          options3.objname = options3.objname.toString(options3.encoding);
        }
      } else if (typeof options3.objname === "string") {
        if (options3.objname.length === 0) {
          throw new Error(`Invalid Option: objname must be a non empty string`);
        }
      } else if (typeof options3.objname === "number") {
      } else {
        throw new Error(`Invalid Option: objname must be a string or a buffer, got ${options3.objname}`);
      }
      if (options3.objname !== void 0) {
        if (typeof options3.objname === "number") {
          if (options3.columns !== false) {
            throw Error("Invalid Option: objname index cannot be combined with columns or be defined as a field");
          }
        } else {
          if (options3.columns === false) {
            throw Error("Invalid Option: objname field must be combined with columns or be defined as an index");
          }
        }
      }
      if (options3.on_record === void 0 || options3.on_record === null) {
        options3.on_record = void 0;
      } else if (typeof options3.on_record !== "function") {
        throw new CsvError("CSV_INVALID_OPTION_ON_RECORD", [
          "Invalid option `on_record`:",
          "expect a function,",
          `got ${JSON.stringify(options3.on_record)}`
        ], options3);
      }
      if (options3.on_skip !== void 0 && options3.on_skip !== null && typeof options3.on_skip !== "function") {
        throw new Error(`Invalid Option: on_skip must be a function, got ${JSON.stringify(options3.on_skip)}`);
      }
      if (options3.quote === null || options3.quote === false || options3.quote === "") {
        options3.quote = null;
      } else {
        if (options3.quote === void 0 || options3.quote === true) {
          options3.quote = Buffer.from('"', options3.encoding);
        } else if (typeof options3.quote === "string") {
          options3.quote = Buffer.from(options3.quote, options3.encoding);
        }
        if (!Buffer.isBuffer(options3.quote)) {
          throw new Error(`Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options3.quote)}`);
        }
      }
      if (options3.raw === void 0 || options3.raw === null || options3.raw === false) {
        options3.raw = false;
      } else if (options3.raw !== true) {
        throw new Error(`Invalid Option: raw must be true, got ${JSON.stringify(options3.raw)}`);
      }
      if (options3.record_delimiter === void 0) {
        options3.record_delimiter = [];
      } else if (typeof options3.record_delimiter === "string" || Buffer.isBuffer(options3.record_delimiter)) {
        if (options3.record_delimiter.length === 0) {
          throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
            "Invalid option `record_delimiter`:",
            "value must be a non empty string or buffer,",
            `got ${JSON.stringify(options3.record_delimiter)}`
          ], options3);
        }
        options3.record_delimiter = [
          options3.record_delimiter
        ];
      } else if (!Array.isArray(options3.record_delimiter)) {
        throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
          "Invalid option `record_delimiter`:",
          "value must be a string, a buffer or array of string|buffer,",
          `got ${JSON.stringify(options3.record_delimiter)}`
        ], options3);
      }
      options3.record_delimiter = options3.record_delimiter.map(function(rd, i) {
        if (typeof rd !== "string" && !Buffer.isBuffer(rd)) {
          throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
            "Invalid option `record_delimiter`:",
            "value must be a string, a buffer or array of string|buffer",
            `at index ${i},`,
            `got ${JSON.stringify(rd)}`
          ], options3);
        } else if (rd.length === 0) {
          throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
            "Invalid option `record_delimiter`:",
            "value must be a non empty string or buffer",
            `at index ${i},`,
            `got ${JSON.stringify(rd)}`
          ], options3);
        }
        if (typeof rd === "string") {
          rd = Buffer.from(rd, options3.encoding);
        }
        return rd;
      });
      if (typeof options3.relax_column_count === "boolean") {
      } else if (options3.relax_column_count === void 0 || options3.relax_column_count === null) {
        options3.relax_column_count = false;
      } else {
        throw new Error(`Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options3.relax_column_count)}`);
      }
      if (typeof options3.relax_column_count_less === "boolean") {
      } else if (options3.relax_column_count_less === void 0 || options3.relax_column_count_less === null) {
        options3.relax_column_count_less = false;
      } else {
        throw new Error(`Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options3.relax_column_count_less)}`);
      }
      if (typeof options3.relax_column_count_more === "boolean") {
      } else if (options3.relax_column_count_more === void 0 || options3.relax_column_count_more === null) {
        options3.relax_column_count_more = false;
      } else {
        throw new Error(`Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options3.relax_column_count_more)}`);
      }
      if (typeof options3.relax_quotes === "boolean") {
      } else if (options3.relax_quotes === void 0 || options3.relax_quotes === null) {
        options3.relax_quotes = false;
      } else {
        throw new Error(`Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(options3.relax_quotes)}`);
      }
      if (typeof options3.skip_empty_lines === "boolean") {
      } else if (options3.skip_empty_lines === void 0 || options3.skip_empty_lines === null) {
        options3.skip_empty_lines = false;
      } else {
        throw new Error(`Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options3.skip_empty_lines)}`);
      }
      if (typeof options3.skip_records_with_empty_values === "boolean") {
      } else if (options3.skip_records_with_empty_values === void 0 || options3.skip_records_with_empty_values === null) {
        options3.skip_records_with_empty_values = false;
      } else {
        throw new Error(`Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(options3.skip_records_with_empty_values)}`);
      }
      if (typeof options3.skip_records_with_error === "boolean") {
      } else if (options3.skip_records_with_error === void 0 || options3.skip_records_with_error === null) {
        options3.skip_records_with_error = false;
      } else {
        throw new Error(`Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(options3.skip_records_with_error)}`);
      }
      if (options3.rtrim === void 0 || options3.rtrim === null || options3.rtrim === false) {
        options3.rtrim = false;
      } else if (options3.rtrim !== true) {
        throw new Error(`Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options3.rtrim)}`);
      }
      if (options3.ltrim === void 0 || options3.ltrim === null || options3.ltrim === false) {
        options3.ltrim = false;
      } else if (options3.ltrim !== true) {
        throw new Error(`Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options3.ltrim)}`);
      }
      if (options3.trim === void 0 || options3.trim === null || options3.trim === false) {
        options3.trim = false;
      } else if (options3.trim !== true) {
        throw new Error(`Invalid Option: trim must be a boolean, got ${JSON.stringify(options3.trim)}`);
      }
      if (options3.trim === true && opts.ltrim !== false) {
        options3.ltrim = true;
      } else if (options3.ltrim !== true) {
        options3.ltrim = false;
      }
      if (options3.trim === true && opts.rtrim !== false) {
        options3.rtrim = true;
      } else if (options3.rtrim !== true) {
        options3.rtrim = false;
      }
      if (options3.to === void 0 || options3.to === null) {
        options3.to = -1;
      } else {
        if (typeof options3.to === "string" && /\d+/.test(options3.to)) {
          options3.to = parseInt(options3.to);
        }
        if (Number.isInteger(options3.to)) {
          if (options3.to <= 0) {
            throw new Error(`Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`);
          }
        } else {
          throw new Error(`Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`);
        }
      }
      if (options3.to_line === void 0 || options3.to_line === null) {
        options3.to_line = -1;
      } else {
        if (typeof options3.to_line === "string" && /\d+/.test(options3.to_line)) {
          options3.to_line = parseInt(options3.to_line);
        }
        if (Number.isInteger(options3.to_line)) {
          if (options3.to_line <= 0) {
            throw new Error(`Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`);
          }
        } else {
          throw new Error(`Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`);
        }
      }
      return options3;
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/index.js
var isRecordEmpty, cr2, nl2, boms, transform;
var init_api = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/api/index.js"() {
    init_normalize_columns_array();
    init_init_state();
    init_normalize_options();
    init_CsvError();
    isRecordEmpty = function(record) {
      return record.every((field) => field == null || field.toString && field.toString().trim() === "");
    };
    cr2 = 13;
    nl2 = 10;
    boms = {
      // Note, the following are equals:
      // Buffer.from("\ufeff")
      // Buffer.from([239, 187, 191])
      // Buffer.from('EFBBBF', 'hex')
      utf8: Buffer.from([
        239,
        187,
        191
      ]),
      // Note, the following are equals:
      // Buffer.from "\ufeff", 'utf16le
      // Buffer.from([255, 254])
      utf16le: Buffer.from([
        255,
        254
      ])
    };
    transform = function(original_options = {}) {
      const info = {
        bytes: 0,
        comment_lines: 0,
        empty_lines: 0,
        invalid_field_length: 0,
        lines: 1,
        records: 0
      };
      const options3 = normalize_options(original_options);
      return {
        info,
        original_options,
        options: options3,
        state: init_state(options3),
        __needMoreData: function(i, bufLen, end) {
          if (end) return false;
          const { encoding, escape: escape5, quote } = this.options;
          const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
          const numOfCharLeft = bufLen - i - 1;
          const requiredLength = Math.max(
            needMoreDataSize,
            // Skip if the remaining buffer smaller than record delimiter
            // If "record_delimiter" is yet to be discovered:
            // 1. It is equals to `[]` and "recordDelimiterMaxLength" equals `0`
            // 2. We set the length to windows line ending in the current encoding
            // Note, that encoding is known from user or bom discovery at that point
            // recordDelimiterMaxLength,
            recordDelimiterMaxLength === 0 ? Buffer.from("\r\n", encoding).length : recordDelimiterMaxLength,
            // Skip if remaining buffer can be an escaped quote
            quoting ? (escape5 === null ? 0 : escape5.length) + quote.length : 0,
            // Skip if remaining buffer can be record delimiter following the closing quote
            quoting ? quote.length + recordDelimiterMaxLength : 0
          );
          return numOfCharLeft < requiredLength;
        },
        // Central parser implementation
        parse: function(nextBuf, end, push3, close) {
          const { bom, comment_no_infix, encoding, from_line, ltrim, max_record_size, raw, relax_quotes, rtrim: rtrim2, skip_empty_lines, to, to_line } = this.options;
          let { comment, escape: escape5, quote, record_delimiter } = this.options;
          const { bomSkipped, previousBuf, rawBuffer, escapeIsQuote } = this.state;
          let buf;
          if (previousBuf === void 0) {
            if (nextBuf === void 0) {
              close();
              return;
            } else {
              buf = nextBuf;
            }
          } else if (previousBuf !== void 0 && nextBuf === void 0) {
            buf = previousBuf;
          } else {
            buf = Buffer.concat([
              previousBuf,
              nextBuf
            ]);
          }
          if (bomSkipped === false) {
            if (bom === false) {
              this.state.bomSkipped = true;
            } else if (buf.length < 3) {
              if (end === false) {
                this.state.previousBuf = buf;
                return;
              }
            } else {
              for (const encoding2 in boms) {
                if (boms[encoding2].compare(buf, 0, boms[encoding2].length) === 0) {
                  const bomLength = boms[encoding2].length;
                  this.state.bufBytesStart += bomLength;
                  buf = buf.slice(bomLength);
                  this.options = normalize_options({
                    ...this.original_options,
                    encoding: encoding2
                  });
                  ({ comment, escape: escape5, quote } = this.options);
                  break;
                }
              }
              this.state.bomSkipped = true;
            }
          }
          const bufLen = buf.length;
          let pos;
          for (pos = 0; pos < bufLen; pos++) {
            if (this.__needMoreData(pos, bufLen, end)) {
              break;
            }
            if (this.state.wasRowDelimiter === true) {
              this.info.lines++;
              this.state.wasRowDelimiter = false;
            }
            if (to_line !== -1 && this.info.lines > to_line) {
              this.state.stop = true;
              close();
              return;
            }
            if (this.state.quoting === false && record_delimiter.length === 0) {
              const record_delimiterCount = this.__autoDiscoverRecordDelimiter(buf, pos);
              if (record_delimiterCount) {
                record_delimiter = this.options.record_delimiter;
              }
            }
            const chr = buf[pos];
            if (raw === true) {
              rawBuffer.append(chr);
            }
            if ((chr === cr2 || chr === nl2) && this.state.wasRowDelimiter === false) {
              this.state.wasRowDelimiter = true;
            }
            if (this.state.escaping === true) {
              this.state.escaping = false;
            } else {
              if (escape5 !== null && this.state.quoting === true && this.__isEscape(buf, pos, chr) && pos + escape5.length < bufLen) {
                if (escapeIsQuote) {
                  if (this.__isQuote(buf, pos + escape5.length)) {
                    this.state.escaping = true;
                    pos += escape5.length - 1;
                    continue;
                  }
                } else {
                  this.state.escaping = true;
                  pos += escape5.length - 1;
                  continue;
                }
              }
              if (this.state.commenting === false && this.__isQuote(buf, pos)) {
                if (this.state.quoting === true) {
                  const nextChr = buf[pos + quote.length];
                  const isNextChrTrimable = rtrim2 && this.__isCharTrimable(buf, pos + quote.length);
                  const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos + quote.length, nextChr);
                  const isNextChrDelimiter = this.__isDelimiter(buf, pos + quote.length, nextChr);
                  const isNextChrRecordDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRecordDelimiter(buf, pos + quote.length) : this.__isRecordDelimiter(nextChr, buf, pos + quote.length);
                  if (escape5 !== null && this.__isEscape(buf, pos, chr) && this.__isQuote(buf, pos + escape5.length)) {
                    pos += escape5.length - 1;
                  } else if (!nextChr || isNextChrDelimiter || isNextChrRecordDelimiter || isNextChrComment || isNextChrTrimable) {
                    this.state.quoting = false;
                    this.state.wasQuoting = true;
                    pos += quote.length - 1;
                    continue;
                  } else if (relax_quotes === false) {
                    const err = this.__error(new CsvError("CSV_INVALID_CLOSING_QUOTE", [
                      "Invalid Closing Quote:",
                      `got "${String.fromCharCode(nextChr)}"`,
                      `at line ${this.info.lines}`,
                      "instead of delimiter, record delimiter, trimable character",
                      "(if activated) or comment"
                    ], this.options, this.__infoField()));
                    if (err !== void 0) return err;
                  } else {
                    this.state.quoting = false;
                    this.state.wasQuoting = true;
                    this.state.field.prepend(quote);
                    pos += quote.length - 1;
                  }
                } else {
                  if (this.state.field.length !== 0) {
                    if (relax_quotes === false) {
                      const info2 = this.__infoField();
                      const bom2 = Object.keys(boms).map((b) => boms[b].equals(this.state.field.toString()) ? b : false).filter(Boolean)[0];
                      const err = this.__error(new CsvError("INVALID_OPENING_QUOTE", [
                        "Invalid Opening Quote:",
                        `a quote is found on field ${JSON.stringify(info2.column)} at line ${info2.lines}, value is ${JSON.stringify(this.state.field.toString(encoding))}`,
                        bom2 ? `(${bom2} bom)` : void 0
                      ], this.options, info2, {
                        field: this.state.field
                      }));
                      if (err !== void 0) return err;
                    }
                  } else {
                    this.state.quoting = true;
                    pos += quote.length - 1;
                    continue;
                  }
                }
              }
              if (this.state.quoting === false) {
                const recordDelimiterLength = this.__isRecordDelimiter(chr, buf, pos);
                if (recordDelimiterLength !== 0) {
                  const skipCommentLine = this.state.commenting && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0;
                  if (skipCommentLine) {
                    this.info.comment_lines++;
                  } else {
                    if (this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1 : 0) >= from_line) {
                      this.state.enabled = true;
                      this.__resetField();
                      this.__resetRecord();
                      pos += recordDelimiterLength - 1;
                      continue;
                    }
                    if (skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0) {
                      this.info.empty_lines++;
                      pos += recordDelimiterLength - 1;
                      continue;
                    }
                    this.info.bytes = this.state.bufBytesStart + pos;
                    const errField = this.__onField();
                    if (errField !== void 0) return errField;
                    this.info.bytes = this.state.bufBytesStart + pos + recordDelimiterLength;
                    const errRecord = this.__onRecord(push3);
                    if (errRecord !== void 0) return errRecord;
                    if (to !== -1 && this.info.records >= to) {
                      this.state.stop = true;
                      close();
                      return;
                    }
                  }
                  this.state.commenting = false;
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                if (this.state.commenting) {
                  continue;
                }
                if (comment !== null && (comment_no_infix === false || this.state.record.length === 0 && this.state.field.length === 0)) {
                  const commentCount = this.__compareBytes(comment, buf, pos, chr);
                  if (commentCount !== 0) {
                    this.state.commenting = true;
                    continue;
                  }
                }
                const delimiterLength = this.__isDelimiter(buf, pos, chr);
                if (delimiterLength !== 0) {
                  this.info.bytes = this.state.bufBytesStart + pos;
                  const errField = this.__onField();
                  if (errField !== void 0) return errField;
                  pos += delimiterLength - 1;
                  continue;
                }
              }
            }
            if (this.state.commenting === false) {
              if (max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size) {
                return this.__error(new CsvError("CSV_MAX_RECORD_SIZE", [
                  "Max Record Size:",
                  "record exceed the maximum number of tolerated bytes",
                  `of ${max_record_size}`,
                  `at line ${this.info.lines}`
                ], this.options, this.__infoField()));
              }
            }
            const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(buf, pos);
            const rappend = rtrim2 === false || this.state.wasQuoting === false;
            if (lappend === true && rappend === true) {
              this.state.field.append(chr);
            } else if (rtrim2 === true && !this.__isCharTrimable(buf, pos)) {
              return this.__error(new CsvError("CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE", [
                "Invalid Closing Quote:",
                "found non trimable byte after quote",
                `at line ${this.info.lines}`
              ], this.options, this.__infoField()));
            } else {
              if (lappend === false) {
                pos += this.__isCharTrimable(buf, pos) - 1;
              }
              continue;
            }
          }
          if (end === true) {
            if (this.state.quoting === true) {
              const err = this.__error(new CsvError("CSV_QUOTE_NOT_CLOSED", [
                "Quote Not Closed:",
                `the parsing is finished with an opening quote at line ${this.info.lines}`
              ], this.options, this.__infoField()));
              if (err !== void 0) return err;
            } else {
              if (this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0) {
                this.info.bytes = this.state.bufBytesStart + pos;
                const errField = this.__onField();
                if (errField !== void 0) return errField;
                const errRecord = this.__onRecord(push3);
                if (errRecord !== void 0) return errRecord;
              } else if (this.state.wasRowDelimiter === true) {
                this.info.empty_lines++;
              } else if (this.state.commenting === true) {
                this.info.comment_lines++;
              }
            }
          } else {
            this.state.bufBytesStart += pos;
            this.state.previousBuf = buf.slice(pos);
          }
          if (this.state.wasRowDelimiter === true) {
            this.info.lines++;
            this.state.wasRowDelimiter = false;
          }
        },
        __onRecord: function(push3) {
          const { columns: columns2, group_columns_by_name, encoding, info: info2, from, relax_column_count, relax_column_count_less, relax_column_count_more, raw, skip_records_with_empty_values } = this.options;
          const { enabled, record } = this.state;
          if (enabled === false) {
            return this.__resetRecord();
          }
          const recordLength = record.length;
          if (columns2 === true) {
            if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
              this.__resetRecord();
              return;
            }
            return this.__firstLineToColumns(record);
          }
          if (columns2 === false && this.info.records === 0) {
            this.state.expectedRecordLength = recordLength;
          }
          if (recordLength !== this.state.expectedRecordLength) {
            const err = columns2 === false ? new CsvError("CSV_RECORD_INCONSISTENT_FIELDS_LENGTH", [
              "Invalid Record Length:",
              `expect ${this.state.expectedRecordLength},`,
              `got ${recordLength} on line ${this.info.lines}`
            ], this.options, this.__infoField(), {
              record
            }) : new CsvError("CSV_RECORD_INCONSISTENT_COLUMNS", [
              "Invalid Record Length:",
              `columns length is ${columns2.length},`,
              `got ${recordLength} on line ${this.info.lines}`
            ], this.options, this.__infoField(), {
              record
            });
            if (relax_column_count === true || relax_column_count_less === true && recordLength < this.state.expectedRecordLength || relax_column_count_more === true && recordLength > this.state.expectedRecordLength) {
              this.info.invalid_field_length++;
              this.state.error = err;
            } else {
              const finalErr = this.__error(err);
              if (finalErr) return finalErr;
            }
          }
          if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
            this.__resetRecord();
            return;
          }
          if (this.state.recordHasError === true) {
            this.__resetRecord();
            this.state.recordHasError = false;
            return;
          }
          this.info.records++;
          if (from === 1 || this.info.records >= from) {
            const { objname } = this.options;
            if (columns2 !== false) {
              const obj = {};
              for (let i = 0, l = record.length; i < l; i++) {
                if (columns2[i] === void 0 || columns2[i].disabled) continue;
                if (group_columns_by_name === true && obj[columns2[i].name] !== void 0) {
                  if (Array.isArray(obj[columns2[i].name])) {
                    obj[columns2[i].name] = obj[columns2[i].name].concat(record[i]);
                  } else {
                    obj[columns2[i].name] = [
                      obj[columns2[i].name],
                      record[i]
                    ];
                  }
                } else {
                  obj[columns2[i].name] = record[i];
                }
              }
              if (raw === true || info2 === true) {
                const extRecord = Object.assign({
                  record: obj
                }, raw === true ? {
                  raw: this.state.rawBuffer.toString(encoding)
                } : {}, info2 === true ? {
                  info: this.__infoRecord()
                } : {});
                const err = this.__push(objname === void 0 ? extRecord : [
                  obj[objname],
                  extRecord
                ], push3);
                if (err) {
                  return err;
                }
              } else {
                const err = this.__push(objname === void 0 ? obj : [
                  obj[objname],
                  obj
                ], push3);
                if (err) {
                  return err;
                }
              }
            } else {
              if (raw === true || info2 === true) {
                const extRecord = Object.assign({
                  record
                }, raw === true ? {
                  raw: this.state.rawBuffer.toString(encoding)
                } : {}, info2 === true ? {
                  info: this.__infoRecord()
                } : {});
                const err = this.__push(objname === void 0 ? extRecord : [
                  record[objname],
                  extRecord
                ], push3);
                if (err) {
                  return err;
                }
              } else {
                const err = this.__push(objname === void 0 ? record : [
                  record[objname],
                  record
                ], push3);
                if (err) {
                  return err;
                }
              }
            }
          }
          this.__resetRecord();
        },
        __firstLineToColumns: function(record) {
          const { firstLineToHeaders } = this.state;
          try {
            const headers = firstLineToHeaders === void 0 ? record : firstLineToHeaders.call(null, record);
            if (!Array.isArray(headers)) {
              return this.__error(new CsvError("CSV_INVALID_COLUMN_MAPPING", [
                "Invalid Column Mapping:",
                "expect an array from column function,",
                `got ${JSON.stringify(headers)}`
              ], this.options, this.__infoField(), {
                headers
              }));
            }
            const normalizedHeaders = normalize_columns_array(headers);
            this.state.expectedRecordLength = normalizedHeaders.length;
            this.options.columns = normalizedHeaders;
            this.__resetRecord();
            return;
          } catch (err) {
            return err;
          }
        },
        __resetRecord: function() {
          if (this.options.raw === true) {
            this.state.rawBuffer.reset();
          }
          this.state.error = void 0;
          this.state.record = [];
          this.state.record_length = 0;
        },
        __onField: function() {
          const { cast, encoding, rtrim: rtrim2, max_record_size } = this.options;
          const { enabled, wasQuoting } = this.state;
          if (enabled === false) {
            return this.__resetField();
          }
          let field = this.state.field.toString(encoding);
          if (rtrim2 === true && wasQuoting === false) {
            field = field.trimRight();
          }
          if (cast === true) {
            const [err, f] = this.__cast(field);
            if (err !== void 0) return err;
            field = f;
          }
          this.state.record.push(field);
          if (max_record_size !== 0 && typeof field === "string") {
            this.state.record_length += field.length;
          }
          this.__resetField();
        },
        __resetField: function() {
          this.state.field.reset();
          this.state.wasQuoting = false;
        },
        __push: function(record, push3) {
          const { on_record } = this.options;
          if (on_record !== void 0) {
            const info2 = this.__infoRecord();
            try {
              record = on_record.call(null, record, info2);
            } catch (err) {
              return err;
            }
            if (record === void 0 || record === null) {
              return;
            }
          }
          push3(record);
        },
        // Return a tuple with the error and the casted value
        __cast: function(field) {
          const { columns: columns2, relax_column_count } = this.options;
          const isColumns = Array.isArray(columns2);
          if (isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length) {
            return [
              void 0,
              void 0
            ];
          }
          if (this.state.castField !== null) {
            try {
              const info2 = this.__infoField();
              return [
                void 0,
                this.state.castField.call(null, field, info2)
              ];
            } catch (err) {
              return [
                err
              ];
            }
          }
          if (this.__isFloat(field)) {
            return [
              void 0,
              parseFloat(field)
            ];
          } else if (this.options.cast_date !== false) {
            const info2 = this.__infoField();
            return [
              void 0,
              this.options.cast_date.call(null, field, info2)
            ];
          }
          return [
            void 0,
            field
          ];
        },
        // Helper to test if a character is a space or a line delimiter
        __isCharTrimable: function(buf, pos) {
          const isTrim = (buf2, pos2) => {
            const { timchars } = this.state;
            loop1: for (let i = 0; i < timchars.length; i++) {
              const timchar = timchars[i];
              for (let j = 0; j < timchar.length; j++) {
                if (timchar[j] !== buf2[pos2 + j]) continue loop1;
              }
              return timchar.length;
            }
            return 0;
          };
          return isTrim(buf, pos);
        },
        // Keep it in case we implement the `cast_int` option
        // __isInt(value){
        //   // return Number.isInteger(parseInt(value))
        //   // return !isNaN( parseInt( obj ) );
        //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
        // }
        __isFloat: function(value) {
          return value - parseFloat(value) + 1 >= 0;
        },
        __compareBytes: function(sourceBuf, targetBuf, targetPos, firstByte) {
          if (sourceBuf[0] !== firstByte) return 0;
          const sourceLength = sourceBuf.length;
          for (let i = 1; i < sourceLength; i++) {
            if (sourceBuf[i] !== targetBuf[targetPos + i]) return 0;
          }
          return sourceLength;
        },
        __isDelimiter: function(buf, pos, chr) {
          const { delimiter, ignore_last_delimiters } = this.options;
          if (ignore_last_delimiters === true && this.state.record.length === this.options.columns.length - 1) {
            return 0;
          } else if (ignore_last_delimiters !== false && typeof ignore_last_delimiters === "number" && this.state.record.length === ignore_last_delimiters - 1) {
            return 0;
          }
          loop1: for (let i = 0; i < delimiter.length; i++) {
            const del = delimiter[i];
            if (del[0] === chr) {
              for (let j = 1; j < del.length; j++) {
                if (del[j] !== buf[pos + j]) continue loop1;
              }
              return del.length;
            }
          }
          return 0;
        },
        __isRecordDelimiter: function(chr, buf, pos) {
          const { record_delimiter } = this.options;
          const recordDelimiterLength = record_delimiter.length;
          loop1: for (let i = 0; i < recordDelimiterLength; i++) {
            const rd = record_delimiter[i];
            const rdLength = rd.length;
            if (rd[0] !== chr) {
              continue;
            }
            for (let j = 1; j < rdLength; j++) {
              if (rd[j] !== buf[pos + j]) {
                continue loop1;
              }
            }
            return rd.length;
          }
          return 0;
        },
        __isEscape: function(buf, pos, chr) {
          const { escape: escape5 } = this.options;
          if (escape5 === null) return false;
          const l = escape5.length;
          if (escape5[0] === chr) {
            for (let i = 0; i < l; i++) {
              if (escape5[i] !== buf[pos + i]) {
                return false;
              }
            }
            return true;
          }
          return false;
        },
        __isQuote: function(buf, pos) {
          const { quote } = this.options;
          if (quote === null) return false;
          const l = quote.length;
          for (let i = 0; i < l; i++) {
            if (quote[i] !== buf[pos + i]) {
              return false;
            }
          }
          return true;
        },
        __autoDiscoverRecordDelimiter: function(buf, pos) {
          const { encoding } = this.options;
          const rds = [
            // Important, the windows line ending must be before mac os 9
            Buffer.from("\r\n", encoding),
            Buffer.from("\n", encoding),
            Buffer.from("\r", encoding)
          ];
          loop: for (let i = 0; i < rds.length; i++) {
            const l = rds[i].length;
            for (let j = 0; j < l; j++) {
              if (rds[i][j] !== buf[pos + j]) {
                continue loop;
              }
            }
            this.options.record_delimiter.push(rds[i]);
            this.state.recordDelimiterMaxLength = rds[i].length;
            return rds[i].length;
          }
          return 0;
        },
        __error: function(msg) {
          const { encoding, raw, skip_records_with_error } = this.options;
          const err = typeof msg === "string" ? new Error(msg) : msg;
          if (skip_records_with_error) {
            this.state.recordHasError = true;
            if (this.options.on_skip !== void 0) {
              this.options.on_skip(err, raw ? this.state.rawBuffer.toString(encoding) : void 0);
            }
            return void 0;
          } else {
            return err;
          }
        },
        __infoDataSet: function() {
          return {
            ...this.info,
            columns: this.options.columns
          };
        },
        __infoRecord: function() {
          const { columns: columns2, raw, encoding } = this.options;
          return {
            ...this.__infoDataSet(),
            error: this.state.error,
            header: columns2 === true,
            index: this.state.record.length,
            raw: raw ? this.state.rawBuffer.toString(encoding) : void 0
          };
        },
        __infoField: function() {
          const { columns: columns2 } = this.options;
          const isColumns = Array.isArray(columns2);
          return {
            ...this.__infoRecord(),
            column: isColumns === true ? columns2.length > this.state.record.length ? columns2[this.state.record.length].name : null : this.state.record.length,
            quoting: this.state.wasQuoting
          };
        }
      };
    };
  }
});

// node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/sync.js
var parse;
var init_sync = __esm({
  "node_modules/.deno/csv-parse@5.6.0/node_modules/csv-parse/lib/sync.js"() {
    init_api();
    parse = function(data, opts = {}) {
      if (typeof data === "string") {
        data = Buffer.from(data);
      }
      const records = opts && opts.objname ? {} : [];
      const parser2 = transform(opts);
      const push3 = (record) => {
        if (parser2.options.objname === void 0) records.push(record);
        else {
          records[record[0]] = record[1];
        }
      };
      const close = () => {
      };
      const err1 = parser2.parse(data, false, push3, close);
      if (err1 !== void 0) throw err1;
      const err2 = parser2.parse(void 0, true, push3, close);
      if (err2 !== void 0) throw err2;
      return records;
    };
  }
});

// src/csv.js
function parseData(source) {
  const rows2 = parse(source);
  const columns2 = /* @__PURE__ */ new Map();
  for (const key of rows2[0]) {
    columns2.set(key, []);
  }
  for (const row of rows2.slice(1)) {
    let index = 0;
    for (const column of columns2.values()) {
      column.push(convert(row[index]));
      index++;
    }
  }
  return immutable_default.OrderedMap(columns2).map(immutable_default.List);
}
function convert(string) {
  string = string.trim();
  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    case "none":
      return null;
  }
  if (number.test(string)) {
    return JSON.parse(string);
  }
  return string;
}
var number;
var init_csv = __esm({
  "src/csv.js"() {
    init_sync();
    init_immutable();
    number = /^\d*\.?\d+([eE][+-]?\d+)?$/;
  }
});

// src/table.js
function showValue(value) {
  if (getType(value) !== "string" || value === "none" || value === "true" || value === "false" || numeric.test(value) || padded.test(value) || escaped.test(value) || invisible.test(value)) {
    return repr(value, true);
  }
  return value;
}
function formatInner(value, length, decimals) {
  if (getType(value) === "number") {
    let numStr = String(value);
    if (decimals) {
      numStr += numStr % 1 ? "0".repeat(decimals - decLength(numStr)) : ".0".padEnd(decimals, "0");
    }
    return numStr.padStart(length);
  }
  if (value === null) {
    return "";
  }
  return showValue(value);
}
function format(value, fmt = {}) {
  const { length = 0 } = fmt;
  const { decimals = 0 } = fmt;
  return formatInner(value, length, decimals).padEnd(length);
}
function decLength(numStr) {
  return numStr.includes(".") ? numStr.length - numStr.indexOf(".") : 0;
}
function getFmt(column, values3) {
  let decimals = 0;
  for (const value of values3) {
    if (getType(value) === "number" && value % 1) {
      decimals = Math.max(decimals, decLength(String(value)));
    }
  }
  let length = format(column).length;
  for (const value of values3) {
    switch (getType(value)) {
      case "number": {
        const numStr = String(value);
        length = Math.max(length, numStr.length + decimals - decLength(numStr));
        break;
      }
      case "none":
        break;
      default:
        length = Math.max(length, showValue(value).length);
    }
  }
  return {
    length,
    decimals
  };
}
var Table, numeric, padded, escaped;
var init_table = __esm({
  "src/table.js"() {
    init_values();
    init_num();
    init_obj();
    init_repr();
    init_panic();
    init_csv();
    init_repr();
    init_immutable();
    Table = class _Table {
      constructor(data = immutable_default.OrderedMap()) {
        checkType(data, "object");
        data = new Map(data);
        this.width = 0;
        this.size = void 0;
        for (const [column, values3] of data) {
          checkType(column, "string");
          this.width++;
          if (getType(values3) === "list") {
            this.size ??= values3.size;
            this.checkColumnLength(values3);
          }
        }
        this.size ??= this.width ? 1 : 0;
        for (const [column, values3] of data) {
          if (getType(values3) !== "list") {
            data.set(column, immutable_default.Repeat(values3, this.size).toList());
          }
        }
        this.data = immutable_default.OrderedMap(data);
      }
      static fromCsv(source) {
        return new _Table(parseData(source));
      }
      static fromRows(rows2, columns2) {
        checkType(rows2, "list");
        checkType(columns2, "list");
        const width = columns2.size;
        const data = /* @__PURE__ */ new Map();
        for (const column of columns2) {
          checkType(column, "string");
          data.set(column, []);
        }
        for (const row of rows2) {
          if (getType(row) !== "object") {
            throw new Panic("table rows must be objects");
          }
          if (row.size !== width) {
            throw new Panic("mismatched columns");
          }
          for (const column of columns2) {
            if (!row.has(column)) {
              throw new Panic("mismatched columns");
            }
            data.get(column).push(row.get(column));
          }
        }
        for (const column of columns2) {
          data.set(column, immutable_default.List(data.get(column)));
        }
        return new _Table(immutable_default.OrderedMap(data));
      }
      equals(other2) {
        return immutable_default.is(this.data, other2.data);
      }
      hashCode() {
        return immutable_default.hash(this.data);
      }
      checkColumnLength(values3) {
        if (this.size && values3.size !== this.size) {
          throw new Panic("mismatched column lengths");
        }
        return values3;
      }
      checkColumns(...columns2) {
        for (const column of columns2) {
          checkType(column, "string");
          if (!this.data.has(column)) {
            throw new Panic("column not found", {
              column
            });
          }
        }
      }
      checkColumnsMatch(matcher, exact = true) {
        if (exact && matcher.size !== this.width) {
          throw new Panic("mismatched keys");
        }
        for (const column of matcher.keys()) {
          if (!this.data.has(column)) {
            throw new Panic("mismatched columns");
          }
        }
      }
      checkIndex(index) {
        checkWhole(index);
        if (index < -this.size || index >= this.size) {
          throw new Panic("index out of range");
        }
        return index;
      }
      checkNonEmpty() {
        if (this.size === 0) {
          throw new Panic("empty table");
        }
        return this;
      }
      get(selector) {
        checkType(selector, "string", "number", "object");
        switch (getType(selector)) {
          case "string":
            return this.getColumn(selector);
          case "number":
            return this.getRow(selector);
          case "object": {
            const index = this.findMatch(selector);
            if (index === void 0) {
              throw new Panic("no match found", {
                matcher: selector
              });
            }
            return this.getRow(index);
          }
        }
      }
      set(selector, value) {
        checkType(selector, "string", "number", "object");
        switch (getType(selector)) {
          case "string":
            return this.setColumn(selector, value);
          case "number":
            return this.setRow(selector, value);
          case "object": {
            const index = this.findMatch(selector);
            value = selector.concat(value);
            return index === void 0 ? this.addRow(value) : this.setRow(index, value);
          }
        }
      }
      columns() {
        return this.data.keySeq().toList();
      }
      async map(func) {
        checkType(func, "function");
        const rows2 = [];
        for (const row of this) {
          rows2.push(await func.call(row));
        }
        return _Table.fromRows(immutable_default.List(rows2), this.columns());
      }
      async filter(func, args = []) {
        checkType(func, "function");
        const rows2 = [];
        for (const row of this) {
          if (await func.callCondition(row, ...args)) {
            rows2.push(row);
          }
        }
        return _Table.fromRows(immutable_default.List(rows2), this.columns());
      }
      getRow(index) {
        this.checkIndex(index);
        const map4 = /* @__PURE__ */ new Map();
        for (const [column, values3] of this.data) {
          map4.set(column, values3.get(index));
        }
        return immutable_default.OrderedMap(map4);
      }
      addRow(row) {
        checkType(row, "object");
        this.checkColumnsMatch(row);
        const data = /* @__PURE__ */ new Map();
        for (const [column, values3] of this.data) {
          data.set(column, values3.push(row.get(column)));
        }
        return new _Table(immutable_default.OrderedMap(data));
      }
      setRow(index, row) {
        this.checkIndex(index);
        checkType(row, "object");
        this.checkColumnsMatch(row);
        const data = /* @__PURE__ */ new Map();
        for (const [column, values3] of this.data) {
          data.set(column, values3.set(index, row.get(column)));
        }
        return new _Table(immutable_default.OrderedMap(data));
      }
      getColumn(column) {
        this.checkColumns(column);
        return this.data.get(column);
      }
      setColumn(column, values3) {
        checkType(column, "string");
        if (getType(values3) !== "list") {
          values3 = immutable_default.Repeat(values3, this.size).toList();
        }
        this.checkColumnLength(values3);
        return new _Table(this.data.set(column, values3));
      }
      select(columns2) {
        checkType(columns2, "list");
        const data = /* @__PURE__ */ new Map();
        for (const column of columns2) {
          this.checkColumns(column);
          data.set(column, this.data.get(column));
        }
        return new _Table(immutable_default.OrderedMap(data));
      }
      *[Symbol.iterator]() {
        for (let index = 0; index < this.size; index++) {
          yield this.getRow(index);
        }
      }
      *entries() {
        for (let index = 0; index < this.size; index++) {
          yield [
            index,
            this.getRow(index)
          ];
        }
      }
      has(selector) {
        checkType(selector, "object", "string");
        if (getType(selector) === "string") {
          return this.data.has(selector);
        }
        return this.findMatch(selector) !== void 0;
      }
      match(matcher) {
        checkType(matcher, "object");
        this.checkColumnsMatch(matcher, false);
        const rows2 = [];
        for (const row of this) {
          if (isMatch(row, matcher)) {
            rows2.push(row);
          }
        }
        return _Table.fromRows(immutable_default.List(rows2), this.columns());
      }
      remove(matcher) {
        checkType(matcher, "object");
        this.checkColumnsMatch(matcher, false);
        const rows2 = [];
        for (const row of this) {
          if (!isMatch(row, matcher)) {
            rows2.push(row);
          }
        }
        return _Table.fromRows(immutable_default.List(rows2), this.columns());
      }
      findMatch(matcher) {
        checkType(matcher, "object");
        this.checkColumnsMatch(matcher, false);
        let index = 0;
        for (const row of this) {
          if (isMatch(row, matcher)) {
            return index;
          }
          index++;
        }
        return void 0;
      }
      concat(other2) {
        checkType(other2, "table");
        this.checkColumnsMatch(other2.data);
        const data = new Map(this.data);
        for (const [column, values3] of data) {
          const otherValues = other2.data.get(column);
          data.set(column, values3.concat(otherValues));
        }
        return new _Table(immutable_default.OrderedMap(data));
      }
      static merge(tables) {
        checkType(tables, "list");
        if (tables.isEmpty()) {
          return new _Table();
        }
        let data = /* @__PURE__ */ new Map();
        const first3 = tables.first();
        checkType(first3, "table");
        for (const column of first3.data.keys()) {
          data.set(column, []);
        }
        data = immutable_default.OrderedMap(data);
        for (const table of tables) {
          checkType(table, "table");
          table.checkColumnsMatch(data);
          for (const [column, values3] of table.data) {
            data.get(column).push(...values3);
          }
        }
        return new _Table(data.map(immutable_default.List));
      }
      toString() {
        const fmts = /* @__PURE__ */ new Map();
        for (const [column, values3] of this.data) {
          fmts.set(column, getFmt(column, values3));
        }
        const lines2 = [];
        function addLine(start, end, sep, pad, handler) {
          const inner = [
            ...fmts
          ].map(([column, fmt]) => handler(column, fmt)).join(pad + sep + pad);
          lines2.push([
            start,
            inner,
            end
          ].join(pad));
        }
        addLine("\u250C", "\u2510", "\u252C", "\u2500", (_, { length }) => "\u2500".repeat(length));
        addLine("\u2502", `\u2502 x ${this.size}`, "\u2502", " ", (column, fmt) => format(column, fmt));
        if (this.size > 0) {
          addLine("\u251C", "\u2524", "\u253C", "\u2500", (_, { length }) => "\u2500".repeat(length));
        }
        for (let i = 0; i < this.size; i++) {
          addLine("\u2502", "\u2502", "\u2502", " ", (column, fmt) => format(this.data.get(column).get(i), fmt));
        }
        addLine("\u2514", "\u2518", "\u2534", "\u2500", (_, { length }) => "\u2500".repeat(length));
        return lines2.join("\n");
      }
    };
    numeric = /^-?\.?[0-9]/;
    padded = /^\s|\s$/;
    escaped = /[\\"\n\r\t]/;
  }
});

// src/func.js
var Func;
var init_func = __esm({
  "src/func.js"() {
    init_values();
    init_panic();
    Func = class {
      constructor(handler, name, params) {
        this.params = params;
        this.name = name;
        this.handler = handler;
      }
      async call(...args) {
        if (args.length !== this.params.length) {
          throw new Panic("wrong number of arguments", {
            numArgs: args.length,
            func: this
          });
        }
        return await this.handler(...args);
      }
      async callCondition(...args) {
        const result = await this.call(...args);
        const $got = getType(result);
        if ($got !== "boolean") {
          throw new Panic("condition function must return boolean", {
            $got
          });
        }
        return result;
      }
      toString() {
        return `${this.name}(${this.params.join(", ")})`;
      }
    };
  }
});

// src/ref.js
var Ref;
var init_ref = __esm({
  "src/ref.js"() {
    init_repr();
    Ref = class {
      constructor(value) {
        this.value = value;
      }
      toString() {
        return `Ref.of(${repr(this.value)})`;
      }
    };
  }
});

// src/values.js
function getType(value) {
  if (value === null) {
    return "none";
  }
  switch (value?.constructor) {
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case String:
      return "string";
    case Table:
      return "table";
    case Func:
      return "function";
    case Ref:
      return "reference";
  }
  if (immutable_default.isOrderedMap(value)) {
    return "object";
  }
  if (immutable_default.isOrderedSet(value)) {
    return "set";
  }
  if (immutable_default.isList(value)) {
    return "list";
  }
  console.error("native value: ", value);
  return `<native ${value?.constructor?.name}>`;
}
function checkType(value, ...types) {
  const $got = getType(value);
  if (!$got) {
    throw new Panic("invalid native value", {
      value
    });
  }
  if (types.length && !types.includes($got)) {
    throw new Panic("type error", {
      $expected: types.join(" or "),
      $got
    });
  }
  return value;
}
function compareAll(a, b, desc) {
  for (let index = 0; index < a.size; index++) {
    const result = compare(a.get(index), b.get(index), desc);
    if (result != 0) {
      return result;
    }
  }
  return 0;
}
function compare(a, b, desc) {
  checkType(a, "number", "string", "boolean", "none");
  checkType(b, "number", "string", "boolean", "none");
  const typeA = getType(a);
  const typeB = getType(b);
  if (typeA === "none") {
    return 1;
  }
  if (typeB === "none") {
    return -1;
  }
  if (typeA !== typeB) {
    throw new Panic("cannot compare values of different types", {
      typeA,
      typeB
    });
  }
  if (a < b) {
    return desc ? 1 : -1;
  }
  if (a > b) {
    return desc ? -1 : 1;
  }
  return 0;
}
var init_values = __esm({
  "src/values.js"() {
    init_panic();
    init_table();
    init_func();
    init_ref();
    init_immutable();
  }
});

// src/repr.js
function escapeInvisible(char) {
  return `\\u{${char.codePointAt(0).toString(16)}}`;
}
function show(value, compact = false) {
  return getType(value) === "string" ? value : repr(value, compact);
}
function repr(value, compact = false) {
  switch (getType(value)) {
    case "boolean":
    case "number":
      if (Number.isNaN(value)) {
        return "Math.nan";
      }
      switch (value) {
        case Infinity:
          return "Math.inf";
        case -Infinity:
          return "-Math.inf";
      }
      return value.toString();
    case "none":
      return "none";
    case "string": {
      const escaped2 = value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n").replaceAll("\r", "\\r").replaceAll("	", "\\t").replaceAll(invisible, escapeInvisible);
      return `"${escaped2}"`;
    }
    case "list":
      return formatElems("[", "]", [
        ...value
      ].map((elem) => repr(elem, compact)), compact);
    case "set":
      return formatElems("Set.of([", "])", [
        ...value
      ].map((elem) => repr(elem, compact)), compact);
    case "object": {
      const entryStrs = [];
      const isRecord2 = value.keySeq().every((key) => getType(key) === "string" && plainKey.test(key));
      for (const [key, val] of value) {
        let valStr = repr(val, compact);
        if (valStr.includes("\n")) {
          switch (getType(val)) {
            case "list":
            case "object":
              valStr = " " + valStr;
              break;
            default:
              valStr = indent("\n" + valStr);
          }
        } else {
          valStr = " " + valStr;
        }
        if (isRecord2) {
          entryStrs.push(`${key}:${valStr}`);
        } else {
          switch (getType(key)) {
            case "none":
            case "boolean":
              entryStrs.push(`(${repr(key, compact)}):${valStr}`);
              break;
            default:
              entryStrs.push(`${repr(key, compact)}:${valStr}`);
          }
        }
      }
      return formatElems("{ ", " }", entryStrs, compact);
    }
    case "table":
      if (compact) {
        const inner = [
          ...value
        ].map((row) => repr(row, true)).join(", ");
        return `Table.of([${inner}])`;
      }
      return String(value);
    default:
      return String(value);
  }
}
function indent(string) {
  return string.split("\n").map((line) => `  ${line}`).join("\n");
}
function calcLength(strings) {
  return strings.map((s) => s.length).reduce((a, b) => a + b, 0);
}
function formatElems(start, end, strings, compact) {
  if (strings.length === 0) {
    return start.trim() + end.trim();
  }
  if (compact || calcLength(strings) < 70) {
    return `${start}${strings.join(", ")}${end}`;
  }
  const elems = strings.map((line) => `${indent(line)},`).join("\n");
  return `${start.trim()}
${elems}
${end.trim()}`;
}
var plainKey, invisible;
var init_repr = __esm({
  "src/repr.js"() {
    init_values();
    plainKey = /^[a-zA-Z][a-zA-Z0-9]*$/;
    invisible = /(?! )[\p{C}\p{Z}]/gu;
  }
});

// src/panic.js
function showDetail([key, value]) {
  if (key.startsWith("$")) {
    return `${key.slice(1)}: ${value}`;
  }
  return `${key}: ${repr(value)}`;
}
var Panic;
var init_panic = __esm({
  "src/panic.js"() {
    init_repr();
    Panic = class extends Error {
      constructor(message, details = {}, loc = void 0) {
        super(message);
        this.details = {
          $panic: this.message,
          ...details
        };
        this.trace = [
          {
            loc
          }
        ];
      }
      setLoc(loc) {
        this.trace.at(-1).loc ??= loc;
        return this;
      }
      pushContext(context) {
        this.trace.at(-1).context = context;
        this.trace.push({});
        return this;
      }
      showTrace() {
        let result = "";
        let lastLoc;
        for (const { context, loc } of this.trace) {
          if (loc && !lastLoc?.sameLine(loc)) {
            result += `

${loc.show(context)}`;
            lastLoc = loc;
          }
        }
        return result;
      }
      toString() {
        return Object.entries(this.details).map(showDetail).join("\n") + this.showTrace();
      }
    };
  }
});

// src/list.js
function checkIndex(list2, index) {
  checkType(list2, "list");
  if (getType(index) !== "number") {
    throw new Panic("list requires numerical index");
  }
  checkWhole(index);
  if (index < -list2.size || index >= list2.size) {
    throw new Panic("list index out of range", {
      index,
      length: list2.size
    });
  }
  return index;
}
function checkNonEmpty(list2) {
  checkType(list2, "list");
  if (list2.size === 0) {
    throw new Panic("empty list");
  }
  return list2;
}
var init_list = __esm({
  "src/list.js"() {
    init_values();
    init_num();
    init_panic();
    init_immutable();
  }
});

// std/Async.js
var Async_exports = {};
__export(Async_exports, {
  $yield: () => $yield,
  getAll: () => getAll,
  getFirst: () => getFirst,
  sleep: () => sleep
});
async function getFirst(funcs) {
  checkType(funcs, "list");
  const promises = funcs.map((func) => {
    checkType(func, "function");
    return func.call();
  });
  return await Promise.race(promises);
}
async function getAll(funcs) {
  checkType(funcs, "list");
  const promises = funcs.map((func) => {
    checkType(func, "function");
    return func.call();
  });
  return immutable_default.List(await Promise.all(promises));
}
async function sleep(ms) {
  await new Promise((next) => setTimeout(next, ms));
  return null;
}
async function $yield() {
  await new Promise((next) => setTimeout(next, 0));
  return null;
}
var init_Async = __esm({
  "std/Async.js"() {
    init_values();
    init_immutable();
  }
});

// std/Bool.js
var Bool_exports = {};
__export(Bool_exports, {
  toNum: () => toNum
});
function toNum(boolean) {
  checkType(boolean, "boolean");
  return boolean ? 1 : 0;
}
var init_Bool = __esm({
  "std/Bool.js"() {
    init_values();
  }
});

// std/Obj.js
var Obj_exports = {};
__export(Obj_exports, {
  focus: () => focus,
  get: () => get11,
  getDefault: () => getDefault,
  has: () => has5,
  isEmpty: () => isEmpty2,
  keys: () => keys2,
  len: () => len,
  matches: () => matches,
  merge: () => merge2,
  of: () => of,
  put: () => put,
  remove: () => remove3,
  removeAll: () => removeAll,
  rename: () => rename,
  select: () => select,
  set: () => set3,
  setDefault: () => setDefault,
  values: () => values2
});
function of(value) {
  checkType(value, "table", "object");
  return getType(value) === "table" ? value.data : value;
}
function has5(object, key) {
  checkType(object, "object");
  return object.has(key);
}
function matches(object, matcher) {
  return isMatch(object, matcher);
}
function get11(object, key) {
  checkKey(object, key);
  return object.get(key);
}
function getDefault(object, key, $default) {
  checkType(object, "object");
  return object.get(key, $default);
}
function set3(object, key, value) {
  checkType(object, "object");
  return object.set(key, value);
}
function put(value, object, key) {
  checkType(object, "object");
  return object.set(key, value);
}
function setDefault(object, key, value) {
  checkType(object, "object");
  return object.has(key) ? object : object.set(key, value);
}
function merge2(objects) {
  checkType(objects, "list");
  objects.forEach((object) => checkType(object, "object"));
  return immutable_default.OrderedMap().concat(...objects);
}
function keys2(object) {
  checkType(object, "object");
  return object.keySeq().toList();
}
function values2(object) {
  checkType(object, "object");
  return object.valueSeq().toList();
}
function len(object) {
  checkType(object, "object");
  return object.size;
}
function isEmpty2(object) {
  return len(object) === 0;
}
function select(object, keys3) {
  checkType(object, "object");
  checkType(keys3, "list");
  const map4 = /* @__PURE__ */ new Map();
  for (const key of keys3) {
    checkKey(object, key);
    map4.set(key, object.get(key));
  }
  return immutable_default.OrderedMap(map4);
}
function focus(object, keys3) {
  checkType(object, "object");
  checkType(keys3, "list");
  const map4 = /* @__PURE__ */ new Map();
  for (const key of keys3) {
    checkKey(object, key);
    map4.set(key, object.get(key));
  }
  for (const [key, value] of object) {
    checkKey(object, key);
    map4.set(key, value);
  }
  return immutable_default.OrderedMap(map4);
}
function remove3(object, key) {
  checkType(object, "object");
  return object.delete(key);
}
function removeAll(object, keys3) {
  checkType(object, "object");
  checkType(keys3, "list");
  return object.deleteAll(keys3);
}
function rename(object, old, $new2) {
  checkType(object, "object");
  checkKey(object, old);
  const map4 = /* @__PURE__ */ new Map();
  for (const [key, value] of object) {
    const newKey = immutable_default.is(key, old) ? $new2 : key;
    map4.set(newKey, value);
  }
  return immutable_default.OrderedMap(map4);
}
var init_Obj = __esm({
  "std/Obj.js"() {
    init_values();
    init_obj();
    init_immutable();
  }
});

// std/Table.js
var Table_exports = {};
__export(Table_exports, {
  $new: () => $new,
  bottom: () => bottom,
  columns: () => columns,
  counts: () => counts,
  defaultCols: () => defaultCols,
  drop: () => drop2,
  dropLast: () => dropLast2,
  filter: () => filter3,
  focus: () => focus2,
  get: () => get12,
  group: () => group,
  has: () => has6,
  indexOf: () => indexOf2,
  isEmpty: () => isEmpty3,
  len: () => len2,
  map: () => map2,
  match: () => match,
  maxAll: () => maxAll,
  maxBy: () => maxBy2,
  merge: () => merge3,
  minAll: () => minAll,
  minBy: () => minBy2,
  of: () => of2,
  pop: () => pop,
  push: () => push,
  put: () => put2,
  remove: () => remove4,
  rename: () => rename2,
  reverse: () => reverse3,
  rows: () => rows,
  select: () => select2,
  set: () => set4,
  sortBy: () => sortBy2,
  sortDescBy: () => sortDescBy,
  splice: () => splice2,
  summarize: () => summarize,
  take: () => take3,
  takeLast: () => takeLast3,
  top: () => top,
  unique: () => unique
});
function flattenCols(table, columns2) {
  checkType(columns2, "string", "list");
  if (getType(columns2) === "string") {
    table.checkColumns(columns2);
    return immutable_default.List([
      columns2
    ]);
  }
  table.checkColumns(...columns2);
  return columns2;
}
function of2(value) {
  checkType(value, "object", "list", "table");
  switch (getType(value)) {
    case "table":
      return value;
    case "object":
      return new Table(value);
  }
  if (!value.size) {
    return new Table();
  }
  checkType(value.first(), "object");
  const columns2 = value.first().keySeq().toList();
  return Table.fromRows(value, columns2);
}
function $new(columns2) {
  checkType(columns2, "list");
  return Table.fromRows(immutable_default.List(), columns2);
}
function len2(table) {
  checkType(table, "table");
  return table.size;
}
function isEmpty3(table) {
  return len2(table) == 0;
}
function defaultCols(table, columns2) {
  checkType(table, "table");
  checkType(columns2, "list");
  if (!table.width) {
    return $new(columns2);
  }
  table.checkColumns(...columns2);
  return table;
}
function rows(table) {
  return immutable_default.List(table);
}
function reverse3(table) {
  checkType(table, "table");
  return of2(immutable_default.List(table).reverse());
}
function unique(table) {
  checkType(table, "table");
  return of2(immutable_default.OrderedSet(table).toList());
}
function get12(table, selector) {
  checkType(table, "table");
  return table.get(selector);
}
function set4(table, selector, value) {
  checkType(table, "table");
  return table.set(selector, value);
}
function put2(value, table, selector) {
  checkType(table, "table");
  return table.set(selector, value);
}
function has6(table, selector) {
  checkType(table, "table");
  return table.has(selector);
}
function columns(table) {
  checkType(table, "table");
  return table.columns();
}
function indexOf2(table, matcher) {
  checkType(table, "table");
  return table.findMatch(matcher) ?? null;
}
function match(table, matcher) {
  checkType(table, "table");
  return table.match(matcher);
}
function remove4(table, selector) {
  checkType(table, "table");
  checkType(selector, "object", "string", "list");
  if (getType(selector) === "object") {
    return table.remove(selector);
  }
  selector = flattenCols(table, selector);
  return new Table(removeAll(table.data, selector));
}
function push(table, row) {
  return table.addRow(row);
}
function pop(table) {
  checkType(table, "table");
  if (table.size === 0) {
    throw new Panic("empty table");
  }
  return dropLast2(table, 1);
}
function splice2(table, index, count3, rows2) {
  checkType(table, "table");
  table.checkIndex(index);
  checkWhole(count3);
  checkType(rows2, "table");
  const newRows = immutable_default.List(table).splice(index, count3, ...rows2);
  return Table.fromRows(newRows, table.columns());
}
function merge3(tables) {
  return Table.merge(tables);
}
function take3(table, count3) {
  checkType(table, "table");
  const data = /* @__PURE__ */ new Map();
  for (const [column, values3] of table.data) {
    data.set(column, take2(values3, count3));
  }
  return new Table(immutable_default.OrderedMap(data));
}
function takeLast3(table, count3) {
  checkType(table, "table");
  const data = /* @__PURE__ */ new Map();
  for (const [column, values3] of table.data) {
    data.set(column, takeLast2(values3, count3));
  }
  return new Table(immutable_default.OrderedMap(data));
}
function drop2(table, count3) {
  checkType(table, "table");
  const data = /* @__PURE__ */ new Map();
  for (const [column, values3] of table.data) {
    data.set(column, drop(values3, count3));
  }
  return new Table(immutable_default.OrderedMap(data));
}
function dropLast2(table, count3) {
  checkType(table, "table");
  const data = /* @__PURE__ */ new Map();
  for (const [column, values3] of table.data) {
    data.set(column, dropLast(values3, count3));
  }
  return new Table(immutable_default.OrderedMap(data));
}
async function map2(table, func) {
  checkType(table, "table");
  return await table.map(func);
}
async function filter3(table, condition) {
  checkType(table, "table");
  return await table.filter(condition);
}
function select2(table, columns2) {
  checkType(table, "table");
  columns2 = flattenCols(table, columns2);
  return new Table(select(table.data, columns2));
}
function focus2(table, columns2) {
  checkType(table, "table");
  columns2 = flattenCols(table, columns2);
  return new Table(focus(table.data, columns2));
}
function rename2(table, old, $new2) {
  checkType(table, "table");
  return new Table(rename(table.data, old, $new2));
}
function selectValues(object, columns2) {
  return columns2.map((column) => get11(object, column));
}
function doSortBy(table, columns2, desc) {
  const rows2 = immutable_default.List([
    ...table
  ]).sortBy((row) => selectValues(row, columns2), (a, b) => compareAll(a, b, desc));
  return of2(rows2);
}
function sortBy2(table, columns2) {
  checkType(table, "table");
  columns2 = flattenCols(table, columns2);
  return doSortBy(table, columns2, false);
}
function sortDescBy(table, columns2) {
  checkType(table, "table");
  columns2 = flattenCols(table, columns2);
  return doSortBy(table, columns2, true);
}
function top(table, columns2, count3) {
  return take3(sortDescBy(table, columns2), count3);
}
function bottom(table, columns2, count3) {
  return take3(sortBy2(table, columns2), count3);
}
function listExtremum(table, columns2, desc) {
  return immutable_default.List([
    ...table
  ]).maxBy((row) => selectValues(row, columns2), (a, b) => compareAll(a, b, desc));
}
function minBy2(table, columns2) {
  checkType(table, "table");
  table.checkNonEmpty();
  return listExtremum(table, flattenCols(table, columns2), true);
}
function maxBy2(table, columns2) {
  checkType(table, "table");
  table.checkNonEmpty();
  return listExtremum(table, flattenCols(table, columns2), false);
}
function listExtremumAll(table, columns2, desc) {
  table.checkNonEmpty();
  columns2 = flattenCols(table, columns2);
  const pairs = [];
  for (const row of table) {
    const rank = selectValues(row, columns2);
    pairs.push({
      row,
      rank
    });
  }
  const ranked = immutable_default.List(pairs);
  const limitRank = ranked.map(({ rank }) => rank).max((a, b) => compareAll(a, b, desc));
  return of2(ranked.filter(({ rank }) => immutable_default.is(rank, limitRank)).map(({ row }) => row));
}
function minAll(table, columns2) {
  checkType(table, "table");
  return isEmpty3(table) ? table : listExtremumAll(table, columns2, true);
}
function maxAll(table, columns2) {
  checkType(table, "table");
  return isEmpty3(table) ? table : listExtremumAll(table, columns2, false);
}
function group(table, columns2) {
  checkType(table, "table");
  columns2 = flattenCols(table, columns2);
  let groups = immutable_default.OrderedMap();
  for (const row of table) {
    const group3 = selectValues(row, columns2);
    if (!groups.has(group3)) {
      groups = groups.set(group3, []);
    }
    groups.get(group3).push(row);
  }
  return groups.valueSeq().map((group3) => of2(immutable_default.List(group3))).toList();
}
async function summarize(table, columns2, reducer) {
  const groups = group(table, columns2);
  columns2 = flattenCols(table, columns2);
  checkType(reducer, "function");
  const rows2 = [];
  for (const group3 of groups) {
    const row = /* @__PURE__ */ new Map();
    for (const column of columns2) {
      const values3 = group3.data.get(column);
      row.set(column, values3.first());
    }
    const summary = await reducer.call(group3);
    checkType(summary, "object");
    rows2.push(immutable_default.OrderedMap(row).concat(summary));
  }
  return of2(immutable_default.List(rows2));
}
function counts(table) {
  checkType(table, "table");
  if (table.data.has("count")) {
    throw new Panic("table already contains column 'count'");
  }
  if (table.data.has("share")) {
    throw new Panic("table already contains column 'share'");
  }
  const counts3 = /* @__PURE__ */ new Map();
  for (const row of table) {
    const column = repr(row);
    if (counts3.has(column)) {
      counts3.get(column).count += 1;
    } else {
      counts3.set(column, {
        row,
        count: 1
      });
    }
  }
  const rows2 = immutable_default.List(counts3.values()).map(({ row, count: count3 }) => row.set("count", count3).set("share", count3 / table.size));
  const result = of2(rows2);
  return sortDescBy(result, "count");
}
var init_Table = __esm({
  "std/Table.js"() {
    init_values();
    init_num();
    init_Obj();
    init_List();
    init_table();
    init_repr();
    init_panic();
    init_immutable();
  }
});

// std/List.js
var List_exports = {};
__export(List_exports, {
  all: () => all,
  any: () => any,
  average: () => average,
  bottom: () => bottom2,
  chunks: () => chunks,
  count: () => count2,
  counts: () => counts2,
  drop: () => drop,
  dropLast: () => dropLast,
  filter: () => filter4,
  find: () => find2,
  get: () => get13,
  group: () => group2,
  has: () => has7,
  hasAll: () => hasAll,
  indexOf: () => indexOf3,
  isEmpty: () => isEmpty4,
  len: () => len3,
  map: () => map3,
  max: () => max2,
  maxAll: () => maxAll2,
  maxBy: () => maxBy3,
  maxNone: () => maxNone,
  median: () => median,
  merge: () => merge4,
  min: () => min2,
  minAll: () => minAll2,
  minBy: () => minBy3,
  minNone: () => minNone,
  normalize: () => normalize,
  of: () => of3,
  percents: () => percents,
  pop: () => pop2,
  push: () => push2,
  put: () => put3,
  range: () => range,
  remove: () => remove5,
  removeAll: () => removeAll2,
  repeat: () => repeat,
  reverse: () => reverse4,
  set: () => set5,
  sort: () => sort2,
  sortBy: () => sortBy3,
  sortDesc: () => sortDesc,
  sortDescBy: () => sortDescBy2,
  span: () => span,
  splice: () => splice3,
  sum: () => sum,
  swap: () => swap,
  take: () => take2,
  takeLast: () => takeLast2,
  top: () => top2,
  unique: () => unique2
});
function of3(values3) {
  checkType(values3, "list", "set", "table");
  return immutable_default.List(values3);
}
function len3(list2) {
  checkType(list2, "list");
  return list2.size;
}
function repeat(value, count3) {
  checkPositive(count3, "number");
  checkWhole(count3);
  return immutable_default.Repeat(value, count3).toList();
}
function isEmpty4(list2) {
  return len3(list2) == 0;
}
function has7(list2, value) {
  checkType(list2, "list");
  return list2.includes(value);
}
function hasAll(list2, values3) {
  checkType(list2, "list");
  return list2.toSet().isSuperset(of3(values3));
}
function get13(list2, index) {
  checkType(list2, "list");
  checkIndex(list2, index);
  return list2.get(index);
}
function set5(list2, index, value) {
  checkType(list2, "list");
  checkIndex(list2, index);
  return list2.set(index, value);
}
function put3(value, list2, index) {
  checkType(list2, "list");
  checkIndex(list2, index);
  return list2.set(index, value);
}
function push2(list2, value) {
  checkType(list2, "list");
  return list2.push(value);
}
function pop2(list2) {
  checkNonEmpty(list2);
  return list2.pop();
}
function reverse4(list2) {
  checkType(list2, "list");
  return list2.reverse();
}
function swap(list2, indexA, indexB) {
  checkType(list2, "list");
  checkIndex(list2, indexA);
  checkIndex(list2, indexB);
  const a = list2.get(indexA);
  const b = list2.get(indexB);
  return list2.set(indexA, b).set(indexB, a);
}
function take2(list2, count3) {
  checkType(list2, "list");
  checkWhole(count3);
  return list2.take(count3);
}
function takeLast2(list2, count3) {
  checkType(list2, "list");
  checkWhole(count3);
  return list2.takeLast(count3);
}
function drop(list2, count3) {
  checkType(list2, "list");
  checkWhole(count3);
  return list2.skip(count3);
}
function dropLast(list2, count3) {
  checkType(list2, "list");
  checkWhole(count3);
  return list2.skipLast(count3);
}
function splice3(list2, index, count3, values3) {
  checkType(list2, "list");
  checkIndex(list2, index);
  checkWhole(count3);
  checkType(values3, "list");
  return list2.splice(index, count3, ...values3);
}
function merge4(lists) {
  checkType(lists, "list");
  lists.forEach((list2) => checkType(list2, "list"));
  return immutable_default.List().concat(...lists);
}
function chunks(list2, count3) {
  checkType(list2, "list");
  checkWhole(count3);
  checkPositive(count3);
  const elems = [];
  for (let index = 0; index < list2.size; index += count3) {
    elems.push(list2.slice(index, index + count3));
  }
  return immutable_default.List(elems);
}
async function map3(list2, func) {
  checkType(list2, "list");
  checkType(func, "function");
  const elems = [];
  for (const value of list2) {
    elems.push(await func.call(value));
  }
  return immutable_default.List(elems);
}
async function filter4(list2, condition) {
  checkType(list2, "list");
  checkType(condition, "function");
  const elems = [];
  for (const value of list2) {
    if (await condition.callCondition(value)) {
      elems.push(value);
    }
  }
  return immutable_default.List(elems);
}
function remove5(list2, value) {
  checkType(list2, "list");
  return list2.filter((elem) => !immutable_default.is(elem, value));
}
function removeAll2(list2, values3) {
  checkType(list2, "list");
  return list2.filter((elem) => !of3(values3).includes(elem));
}
async function find2(list2, condition) {
  checkType(list2, "list");
  checkType(condition, "function");
  for (const value of list2) {
    if (await condition.callCondition(value)) {
      return value;
    }
  }
  return null;
}
function indexOf3(list2, value) {
  checkType(list2, "list");
  const index = list2.indexOf(value);
  return index >= 0 ? index : null;
}
function count2(list2, value) {
  checkType(list2, "list");
  return list2.count((elem) => immutable_default.is(elem, value));
}
async function group2(list2, func) {
  checkType(list2, "list");
  checkType(func, "function");
  const groups = /* @__PURE__ */ new Map();
  for (const value of list2) {
    const group3 = await func.call(value);
    if (!groups.has(group3)) {
      groups.set(group3, []);
    }
    groups.get(group3).push(value);
  }
  return immutable_default.OrderedMap(groups).map(immutable_default.List);
}
function doSort(list2, desc) {
  checkType(list2, "list");
  return list2.sort((a, b) => compare(a, b, desc));
}
function sort2(list2) {
  return doSort(list2, false);
}
function sortDesc(list2) {
  return doSort(list2, true);
}
async function doSortBy2(list2, ranker, desc) {
  checkType(list2, "list");
  checkType(ranker, "function");
  const ranks = [];
  for (const value of list2) {
    ranks.push({
      rank: await ranker.call(value),
      value
    });
  }
  return immutable_default.List(ranks.sort((a, b) => compare(a.rank, b.rank, desc)).map(({ value }) => value));
}
async function sortBy3(list2, ranker) {
  return await doSortBy2(list2, ranker, false);
}
async function sortDescBy2(list2, ranker) {
  return await doSortBy2(list2, ranker, true);
}
function top2(list2, count3) {
  return take2(sortDesc(list2), count3);
}
function bottom2(list2, count3) {
  return take2(sort2(list2), count3);
}
async function getRanked(list2, desc, func) {
  const pairs = [];
  for (const value of list2) {
    const rank = func ? await func.call(value) : value;
    checkType(rank, "number", "string", "boolean", "none");
    pairs.push({
      value,
      rank
    });
  }
  const ranked = immutable_default.List(pairs);
  const limit2 = ranked.maxBy(({ rank }) => rank, (a, b) => compare(a, b, desc));
  return {
    ranked,
    limit: limit2
  };
}
async function min2(list2) {
  checkType(list2, "list");
  checkNonEmpty(list2);
  return (await getRanked(list2, true, null)).limit.rank;
}
async function max2(list2) {
  checkType(list2, "list");
  checkNonEmpty(list2);
  return (await getRanked(list2, false, null)).limit.rank;
}
async function minBy3(list2, func) {
  checkType(list2, "list");
  checkType(func, "function");
  checkNonEmpty(list2);
  return (await getRanked(list2, true, func)).limit.value;
}
async function maxBy3(list2, func) {
  checkType(list2, "list");
  checkType(func, "function");
  checkNonEmpty(list2);
  return (await getRanked(list2, false, func)).limit.value;
}
async function listExtremumAll2(list2, desc, func) {
  const { ranked, limit: limit2 } = await getRanked(list2, desc, func);
  return ranked.filter(({ rank }) => rank == limit2.rank).map(({ value }) => value);
}
async function minAll2(list2, func) {
  checkType(list2, "list");
  checkType(func, "function");
  return isEmpty4(list2) ? list2 : await listExtremumAll2(list2, true, func);
}
async function maxAll2(list2, func) {
  checkType(list2, "list");
  checkType(func, "function");
  return isEmpty4(list2) ? list2 : await listExtremumAll2(list2, false, func);
}
async function minNone(list2) {
  checkType(list2, "list");
  return isEmpty4(list2) ? null : (await getRanked(list2, true, null)).limit.rank;
}
async function maxNone(list2) {
  checkType(list2, "list");
  return isEmpty4(list2) ? null : (await getRanked(list2, false, null)).limit.rank;
}
function sum(numbers) {
  checkType(numbers, "list");
  let result = 0;
  for (const n of numbers) {
    result += checkType(n, "number");
  }
  return checkNumResult(result);
}
function average(numbers) {
  checkType(numbers, "list");
  checkNonEmpty(numbers);
  return sum(numbers) / numbers.size;
}
function median(numbers) {
  checkType(numbers, "list");
  checkNonEmpty(numbers);
  const sorted = [
    ...sort2(numbers)
  ];
  if (sorted.length % 2 == 1) {
    return sorted[Math.floor(sorted.length / 2)];
  }
  const a = sorted[sorted.length / 2 - 1] / 2;
  const b = sorted[sorted.length / 2] / 2;
  return checkNumResult(a + b);
}
function counts2(list2) {
  checkType(list2, "list");
  const counts3 = /* @__PURE__ */ new Map();
  for (const value of list2) {
    const count3 = counts3.get(value) ?? 0;
    counts3.set(value, count3 + 1);
  }
  const columns2 = (/* @__PURE__ */ new Map()).set("value", immutable_default.List(counts3.keys())).set("count", immutable_default.List(counts3.values())).set("share", immutable_default.List(counts3.values().map((c) => c / list2.size)));
  return sortDescBy(new Table(immutable_default.OrderedMap(columns2)), "count");
}
function all(list2) {
  checkType(list2, "list");
  for (const value of list2) {
    if (!checkType(value, "boolean")) {
      return false;
    }
  }
  return true;
}
function any(list2) {
  checkType(list2, "list");
  for (const value of list2) {
    if (checkType(value, "boolean")) {
      return true;
    }
  }
  return false;
}
function unique2(list2) {
  checkType(list2, "list");
  return list2.toOrderedSet().toList();
}
function span(from, to) {
  checkWhole(from);
  checkWhole(to);
  const min4 = Math.min(from, to);
  const max4 = Math.max(from, to);
  const elems = [];
  for (let n = min4; n <= max4; n++) {
    elems.push(n);
  }
  return from < to ? immutable_default.List(elems) : immutable_default.List(elems).reverse();
}
function range(limit2) {
  checkWhole(limit2);
  if (limit2 < 1) {
    return immutable_default.List();
  }
  return span(0, limit2 - 1);
}
function normalize(numbers) {
  checkType(numbers, "list");
  let total = 0;
  for (const n of numbers) {
    checkType(n, "number");
    checkPositive(n);
    total += n;
  }
  if (total == 0) {
    throw new Panic("cannot normalize numbers with sum 0");
  }
  return numbers.map((n) => checkNumResult(n / total));
}
function percents(numbers) {
  return normalize(numbers).map((n) => n * 100);
}
var init_List = __esm({
  "std/List.js"() {
    init_Table();
    init_num();
    init_list();
    init_values();
    init_table();
    init_panic();
    init_immutable();
  }
});

// std/Char.js
var Char_exports = {};
__export(Char_exports, {
  code: () => code,
  of: () => of4,
  span: () => span2
});
function of4(code2) {
  checkPositive(code2);
  checkWhole(code2);
  return String.fromCodePoint(code2);
}
function code(char) {
  checkChar(char);
  return char.codePointAt(0);
}
function checkChar(string) {
  checkType(string, "string");
  if ([
    ...string
  ].length != 1) {
    throw new Panic("expected a single character", {
      string
    });
  }
}
function span2(from, to) {
  checkChar(from);
  checkChar(to);
  return span(from.codePointAt(0), to.codePointAt(0)).map(of4);
}
var init_Char = __esm({
  "std/Char.js"() {
    init_values();
    init_num();
    init_List();
    init_panic();
  }
});

// repl/prompt.js
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
async function loadHistory() {
  try {
    const text = await readFile(historyPath, "utf8");
    return text.split("\n").map((line) => JSON.parse(`"${line}"`));
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeFile(historyPath, "");
      return [];
    } else {
      throw err;
    }
  }
}
async function getLine(message) {
  history ??= await loadHistory();
  return new Promise((resolve3, reject) => {
    let open2 = true;
    const rl = createInterface({
      input: stdin,
      output: stdout,
      // readline will modify history array
      // clone so we can keep track history ourselves
      history: [
        ...history
      ],
      prompt: message
    });
    rl.prompt();
    function cleanup() {
      open2 = false;
      rl.close();
    }
    rl.on("line", async (line) => {
      cleanup();
      await addHistory(history, line);
      resolve3(line);
    });
    rl.on("SIGINT", () => {
      cleanup();
      console.log();
      reject(new Panic("keyboard interrupt"));
    });
    rl.on("close", () => {
      if (open2) {
        cleanup();
        console.log();
        reject(new Panic("EOF interrupt"));
      }
    });
  });
}
async function addHistory(history2, line) {
  line = line.trim();
  if (line !== history2[0]) {
    history2.unshift(line);
    if (history2.length > limit) {
      history2.pop();
    }
    const serialized = history2.map((entry) => JSON.stringify(entry).slice(1, -1)).join("\n");
    await writeFile(historyPath, serialized);
  }
}
var historyPath, history, limit;
var init_prompt = __esm({
  "repl/prompt.js"() {
    init_panic();
    historyPath = tmpdir() + "/repl-history";
    limit = 50;
  }
});

// std/Console.js
var Console_exports = {};
__export(Console_exports, {
  clear: () => clear2,
  debug: () => debug,
  error: () => error,
  pauseStdin: () => pauseStdin,
  print: () => print,
  prompt: () => prompt,
  rawKey: () => rawKey,
  write: () => write
});
import { emitKeypressEvents } from "node:readline";
import { stdin as stdin2, stdout as stdout2 } from "node:process";
function print(value) {
  console.log(show(value));
  return value;
}
function debug(value) {
  console.log(repr(value));
  return value;
}
function write(string) {
  checkType(string, "string");
  stdout2.write(string);
  return string;
}
function error(value) {
  console.error(show(value));
  return value;
}
function clear2() {
  console.clear();
  return null;
}
async function prompt(message) {
  checkType(message, "string");
  return await getLine(message);
}
function rawKey() {
  return new Promise((resolve3, reject) => {
    emitKeypressEvents(stdin2);
    stdin2.setRawMode(true);
    stdin2.resume();
    stdin2.once("keypress", (str, key) => {
      stdin2.setRawMode(false);
      stdin2.pause();
      if (key.ctrl && key.name === "c") {
        console.log();
        reject(new Panic("keyboard interrupt"));
        return;
      }
      if (key.ctrl && key.name === "d") {
        console.log();
        reject(new Panic("EOF interrupt"));
        return;
      }
      const map4 = (/* @__PURE__ */ new Map()).set("str", str ?? null).set("name", key.name).set("ctrl", key.ctrl).set("meta", key.meta).set("shift", key.shift).set("sequence", key.sequence);
      resolve3(immutable_default.OrderedMap(map4));
    });
  });
}
function pauseStdin() {
  stdin2.pause();
  return null;
}
var init_Console = __esm({
  "std/Console.js"() {
    init_repr();
    init_values();
    init_panic();
    init_prompt();
    init_immutable();
  }
});

// src/err.js
var Err;
var init_err = __esm({
  "src/err.js"() {
    init_panic();
    Err = class extends Panic {
      constructor(payload) {
        super("unhandled error", {
          payload
        });
        this.payload = payload;
      }
    };
  }
});

// std/Err.js
var Err_exports = {};
__export(Err_exports, {
  $throw: () => $throw,
  $try: () => $try,
  orElse: () => orElse
});
function $throw(payload) {
  throw new Err(payload);
}
async function $try(func, handler) {
  checkType(func, "function");
  checkType(handler, "function");
  try {
    return await func.call();
  } catch (err) {
    if (err instanceof Err) {
      return await handler.call(err.payload);
    }
    throw err;
  }
}
async function orElse(func, $default) {
  checkType(func, "function");
  try {
    return await func.call();
  } catch (err) {
    if (err instanceof Err) {
      return $default;
    }
    throw err;
  }
}
var init_Err = __esm({
  "std/Err.js"() {
    init_values();
    init_err();
  }
});

// std/Fs.js
var Fs_exports = {};
__export(Fs_exports, {
  ls: () => ls,
  read: () => read,
  readBytes: () => readBytes,
  write: () => write2,
  writeBytes: () => writeBytes
});
import { readdir, readFile as readFile2, writeFile as writeFile2 } from "node:fs/promises";
import { resolve } from "node:path";
import { Buffer as Buffer2 } from "node:buffer";
async function read(path2) {
  checkType(path2, "string");
  try {
    return await readFile2(path2, {
      encoding: "utf8"
    });
  } catch (err) {
    throw new Panic("file read error", {
      path: path2,
      err: String(err)
    });
  }
}
async function readBytes(path2) {
  try {
    return immutable_default.List(await readFile2(path2));
  } catch (err) {
    throw new Panic("file read error", {
      path: path2,
      err: String(err)
    });
  }
}
async function write2(value, path2) {
  checkType(path2, "string");
  try {
    const string = show(value);
    await writeFile2(path2, string);
    return string;
  } catch (err) {
    throw new Panic("file write error", {
      path: path2,
      err: String(err)
    });
  }
}
async function writeBytes(bytes, path2) {
  checkType(path2, "string");
  checkType(bytes, "list");
  for (const byte of bytes) {
    checkType(byte, "number");
    checkWhole(byte);
    if (byte < 0 || byte > 255) {
      throw new Panic("byte out of range", {
        byte
      });
    }
  }
  await writeFile2(path2, Buffer2.from([
    ...bytes
  ]));
  return bytes;
}
async function ls(path2) {
  const fullPath = resolve(path2);
  try {
    const entries3 = await readdir(fullPath, {
      withFileTypes: true
    });
    return immutable_default.List(entries3.map((entry) => entry.isDirectory() ? `${entry.name}/` : entry.name));
  } catch (_) {
    throw new Panic("cannot access", {
      path: fullPath
    });
  }
}
var init_Fs = __esm({
  "std/Fs.js"() {
    init_repr();
    init_values();
    init_num();
    init_panic();
    init_immutable();
  }
});

// std/Math.js
var Math_exports = {};
__export(Math_exports, {
  abs: () => abs,
  acos: () => acos,
  asin: () => asin,
  atan: () => atan,
  atan2: () => atan2,
  ceil: () => ceil,
  clamp: () => clamp,
  cos: () => cos,
  e: () => e,
  floor: () => floor,
  inf: () => inf,
  isEven: () => isEven,
  isInt: () => isInt,
  isOdd: () => isOdd,
  ln: () => ln,
  log10: () => log10,
  log2: () => log2,
  logBase: () => logBase,
  max: () => max3,
  min: () => min3,
  nan: () => nan,
  pi: () => pi,
  round: () => round,
  roundTo: () => roundTo,
  sign: () => sign,
  sin: () => sin,
  sqrt: () => sqrt,
  tan: () => tan,
  tau: () => tau,
  toDegrees: () => toDegrees,
  toRadians: () => toRadians,
  wrap: () => wrap
});
function isInt(n) {
  checkType(n, "number");
  return Number.isInteger(n);
}
function abs(n) {
  checkType(n, "number");
  return Math.abs(n);
}
function floor(n) {
  checkType(n, "number");
  return Math.floor(n);
}
function ceil(n) {
  checkType(n, "number");
  return Math.ceil(n);
}
function round(n) {
  checkType(n, "number");
  if (n % 1 === 0.5) {
    const floor2 = Math.floor(n);
    return floor2 % 2 === 0 ? floor2 : floor2 + 1;
  }
  return Math.round(n);
}
function roundTo(n, decimals) {
  checkType(n, "number");
  checkWhole(decimals);
  if (decimals < 0) {
    const factor2 = 10 ** -decimals;
    return round(n / factor2) * factor2;
  }
  const factor = 10 ** decimals;
  return round(n * factor) / factor;
}
function min3(a, b) {
  checkType(a, "number");
  checkType(b, "number");
  return Math.min(a, b);
}
function max3(a, b) {
  checkType(a, "number");
  checkType(b, "number");
  return Math.max(a, b);
}
function clamp(n, min4, max4) {
  checkType(n, "number");
  checkType(min4, "number");
  checkType(max4, "number");
  return Math.max(min4, Math.min(max4, n));
}
function wrap(n, start, limit2) {
  checkType(n, "number");
  checkType(start, "number");
  checkType(limit2, "number");
  if (start >= limit2) {
    throw new Panic("start must be less than limit");
  }
  const diff = limit2 - start;
  const offset = ((n - start) % diff + diff) % diff;
  return start + offset;
}
function sign(n) {
  checkType(n, "number");
  return Math.sign(n);
}
function isEven(n) {
  checkWhole(n);
  return n % 2 === 0;
}
function isOdd(n) {
  checkWhole(n);
  return n % 2 !== 0;
}
function sqrt(n) {
  checkType(n, "number");
  checkPositive(n);
  return Math.sqrt(n);
}
function acos(n) {
  checkType(n, "number");
  return checkNumResult(Math.acos(n));
}
function asin(n) {
  checkType(n, "number");
  return checkNumResult(Math.asin(n));
}
function atan(n) {
  checkType(n, "number");
  return Math.atan(n);
}
function atan2(y, x) {
  checkType(y, "number");
  checkType(x, "number");
  return Math.atan2(y, x);
}
function ln(n) {
  checkType(n, "number");
  checkPositive(n, "number");
  return Math.log(n);
}
function log10(n) {
  return ln(n) / Math.LN10;
}
function log2(n) {
  return ln(n) / Math.LN2;
}
function logBase(a, b) {
  return ln(a) / ln(b);
}
function cos(n) {
  checkType(n, "number");
  return Math.cos(n);
}
function sin(n) {
  checkType(n, "number");
  return Math.sin(n);
}
function tan(n) {
  checkType(n, "number");
  return Math.tan(n);
}
function toDegrees(radians) {
  checkType(radians, "number");
  return radians * 180 / Math.PI;
}
function toRadians(degrees) {
  checkType(degrees, "number");
  return degrees * Math.PI / 180;
}
var pi, tau, e, inf, nan;
var init_Math = __esm({
  "std/Math.js"() {
    init_values();
    init_num();
    init_panic();
    pi = Math.PI;
    tau = pi * 2;
    e = Math.E;
    inf = Infinity;
    nan = NaN;
  }
});

// std/None.js
var None_exports = {};
__export(None_exports, {
  orElse: () => orElse2
});
function orElse2(value, $default) {
  return getType(value) === "none" ? $default : value;
}
var init_None = __esm({
  "std/None.js"() {
    init_values();
  }
});

// std/Panic.js
var Panic_exports = {};
__export(Panic_exports, {
  raise: () => raise,
  unimplemented: () => unimplemented,
  unreachable: () => unreachable
});
function raise(message) {
  checkType(message, "string");
  throw new Panic(message);
}
function unreachable() {
  throw new Panic("encountered unreachable code");
}
function unimplemented() {
  throw new Panic("not implemented");
}
var init_Panic = __esm({
  "std/Panic.js"() {
    init_values();
    init_panic();
  }
});

// std/Rand.js
var Rand_exports = {};
__export(Rand_exports, {
  bool: () => bool,
  random: () => random,
  range: () => range2,
  sample: () => sample,
  shuffle: () => shuffle,
  span: () => span3
});
function random() {
  return Math.random();
}
function bool() {
  return Math.random() > 0.5;
}
function sample(values3) {
  checkType(values3, "list", "table", "set");
  const index = Math.floor(Math.random() * values3.size);
  if (getType(values3) === "set") {
    values3 = immutable_default.List(values3);
  }
  if (getType(values3) === "list") {
    checkNonEmpty(values3);
    return values3.get(index);
  }
  values3.checkNonEmpty();
  return values3.getRow(index);
}
function span3(from, to) {
  checkWhole(from);
  checkWhole(to);
  const min4 = Math.min(from, to);
  const max4 = Math.max(from, to);
  return Math.floor(Math.random() * (max4 - min4 + 1)) + min4;
}
function range2(limit2) {
  checkWhole(limit2);
  return span3(0, limit2 - 1);
}
function shuffle(values3) {
  checkType(values3, "list", "table");
  const items = [
    ...values3
  ];
  for (let i = items.length - 1; i > 0; i--) {
    const j = span3(0, i);
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return getType(values3) === "list" ? immutable_default.List(items) : Table.fromRows(immutable_default.List(items), values3.keys());
}
var init_Rand = __esm({
  "std/Rand.js"() {
    init_values();
    init_num();
    init_list();
    init_table();
    init_immutable();
  }
});

// std/Ref.js
var Ref_exports = {};
__export(Ref_exports, {
  get: () => get14,
  of: () => of5,
  put: () => put4,
  set: () => set6
});
function of5(value) {
  return new Ref(value);
}
function get14(ref) {
  checkType(ref, "reference");
  return ref.value;
}
function set6(ref, value) {
  checkType(ref, "reference");
  ref.value = value;
  return ref;
}
function put4(value, ref) {
  checkType(ref, "reference");
  ref.value = value;
  return value;
}
var init_Ref = __esm({
  "std/Ref.js"() {
    init_ref();
    init_values();
  }
});

// std/Re.js
var Re_exports = {};
__export(Re_exports, {
  escape: () => escape2,
  match: () => match2,
  replace: () => replace,
  replaceBy: () => replaceBy,
  split: () => split,
  test: () => test
});
function lookup(pattern) {
  if (!cache.has(pattern)) {
    cache.set(pattern, new RegExp(pattern, "g"));
  }
  return cache.get(pattern);
}
function escape2(string) {
  checkType(string, "string");
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function test(string, pattern) {
  checkType(string, "string");
  checkType(pattern, "string");
  return lookup(pattern).test(string);
}
function match2(string, pattern) {
  checkType(string, "string");
  checkType(pattern, "string");
  const matches2 = immutable_default.List(string.matchAll(lookup(pattern)) ?? []);
  const rows2 = matches2.map((result) => {
    const value = result[0];
    const index = result.index;
    const groups = immutable_default.List(result.slice(1));
    const named = immutable_default.OrderedMap(Object.entries(result.groups ?? {}));
    return immutable_default.OrderedMap(Object.entries({
      value,
      index,
      groups,
      named
    }));
  });
  return Table.fromRows(rows2, immutable_default.List([
    "value",
    "index",
    "groups",
    "named"
  ]));
}
function split(string, pattern) {
  checkType(string, "string");
  checkType(pattern, "string");
  return immutable_default.List(string.split(lookup(pattern)));
}
function replace(string, pattern, replacement) {
  checkType(string, "string");
  checkType(pattern, "string");
  checkType(replacement, "string");
  return string.replaceAll(lookup(pattern), () => replacement);
}
async function replaceBy(string, pattern, replacer) {
  checkType(string, "string");
  checkType(pattern, "string");
  checkType(replacer, "function");
  const replacements = [];
  for (const match3 of string.matchAll(lookup(pattern))) {
    replacements.push(show(await replacer.call(match3[0])));
  }
  replacements.reverse();
  return string.replaceAll(lookup(pattern), () => replacements.pop());
}
var cache;
var init_Re = __esm({
  "std/Re.js"() {
    init_values();
    init_repr();
    init_table();
    init_immutable();
    cache = /* @__PURE__ */ new Map();
  }
});

// std/Set.js
var Set_exports = {};
__export(Set_exports, {
  add: () => add,
  addAll: () => addAll,
  empty: () => empty,
  has: () => has8,
  hasAll: () => hasAll2,
  intersection: () => intersection,
  isEmpty: () => isEmpty5,
  len: () => len4,
  merge: () => merge5,
  of: () => of6,
  powerset: () => powerset,
  remove: () => remove6,
  removeAll: () => removeAll3
});
function of6(values3) {
  checkType(values3, "set", "list", "table");
  return immutable_default.OrderedSet(values3);
}
function len4(set7) {
  checkType(set7, "set");
  return set7.size;
}
function isEmpty5(set7) {
  return len4(set7) == 0;
}
function has8(set7, value) {
  checkType(set7, "set");
  return set7.has(value);
}
function hasAll2(set7, values3) {
  checkType(set7, "set");
  return set7.isSuperset(of6(values3));
}
function add(set7, value) {
  checkType(set7, "set");
  return set7.add(value);
}
function addAll(set7, values3) {
  checkType(set7, "set");
  return set7.union(of6(values3));
}
function remove6(set7, value) {
  checkType(set7, "set");
  return set7.delete(value);
}
function removeAll3(set7, values3) {
  checkType(set7, "set");
  return set7.subtract(of6(values3));
}
function merge5(sets) {
  checkType(sets, "list");
  return immutable_default.OrderedSet().concat(...sets.map(of6));
}
function intersection(set7, values3) {
  checkType(set7, "set");
  return set7.intersect(of6(values3));
}
function subsets(elems) {
  if (!elems.length) {
    return [
      []
    ];
  }
  const suffixes = subsets(elems.slice(1));
  return [
    ...suffixes.map((subset) => [
      elems[0],
      ...subset
    ]),
    ...suffixes
  ];
}
function powerset(set7) {
  checkType(set7, "set");
  const sets = subsets([
    ...set7
  ]).map((elems) => immutable_default.OrderedSet(elems));
  return immutable_default.List(sets);
}
var empty;
var init_Set = __esm({
  "std/Set.js"() {
    init_values();
    init_immutable();
    empty = immutable_default.OrderedSet();
  }
});

// std/Str.js
var Str_exports = {};
__export(Str_exports, {
  chars: () => chars,
  drop: () => drop3,
  dropLast: () => dropLast3,
  endsWith: () => endsWith,
  get: () => get15,
  has: () => has9,
  indexOf: () => indexOf4,
  isAlpha: () => isAlpha,
  isAlphaNum: () => isAlphaNum,
  isAsciiAlpha: () => isAsciiAlpha,
  isAsciiAlphaNum: () => isAsciiAlphaNum,
  isAsciiDigit: () => isAsciiDigit,
  isDigit: () => isDigit,
  isEmpty: () => isEmpty6,
  isLower: () => isLower,
  isUpper: () => isUpper,
  join: () => join2,
  len: () => len5,
  lines: () => lines,
  of: () => of7,
  padLeft: () => padLeft,
  padRight: () => padRight,
  parse: () => parse3,
  repeat: () => repeat2,
  replace: () => replace2,
  replaceFirst: () => replaceFirst,
  reverse: () => reverse5,
  splice: () => splice4,
  split: () => split2,
  startsWith: () => startsWith,
  take: () => take4,
  takeLast: () => takeLast4,
  toLower: () => toLower,
  toUpper: () => toUpper,
  trim: () => trim,
  trimLeft: () => trimLeft,
  trimRight: () => trimRight
});
function of7(value) {
  return show(value);
}
function len5(string) {
  checkType(string, "string");
  return [
    ...string
  ].length;
}
function isEmpty6(string) {
  return len5(string) == 0;
}
function chars(string) {
  checkType(string, "string");
  return immutable_default.List([
    ...string
  ]);
}
function lines(string) {
  checkType(string, "string");
  return immutable_default.List(string.split(newline));
}
function get15(string, index) {
  checkType(string, "string");
  checkWhole(index);
  const chars2 = [
    ...string
  ];
  if (index < -chars2.length || index >= chars2.length) {
    throw new Panic("string index out of range", {
      index,
      length: chars2.length
    });
  }
  return chars2.at(index);
}
function take4(string, count3) {
  checkType(string, "string");
  checkWhole(count3);
  return [
    ...string
  ].slice(0, count3).join("");
}
function takeLast4(string, count3) {
  checkType(string, "string");
  checkWhole(count3);
  return [
    ...string
  ].slice(-count3).join("");
}
function drop3(string, count3) {
  checkType(string, "string");
  checkWhole(count3);
  return [
    ...string
  ].slice(count3).join("");
}
function dropLast3(string, count3) {
  checkType(string, "string");
  checkWhole(count3);
  return [
    ...string
  ].slice(0, -count3).join("");
}
function splice4(string, index, count3, subString) {
  checkType(string, "string");
  const chars2 = immutable_default.List([
    ...string
  ]);
  checkIndex(chars2, index);
  checkWhole(count3);
  checkType(subString, "string");
  return chars2.splice(index, count3, subString).join("");
}
function split2(string, separator) {
  checkType(string, "string");
  checkType(separator, "string");
  return immutable_default.List(string.split(separator));
}
function join2(list2, separator) {
  checkType(list2, "list");
  checkType(separator, "string");
  return list2.map(show).join(separator);
}
function repeat2(string, count3) {
  checkType(string, "string");
  checkType(count3, "number");
  checkWhole(count3);
  return string.repeat(Math.max(0, count3));
}
function reverse5(string) {
  checkType(string, "string");
  return [
    ...string
  ].reverse().join("");
}
function replace2(string, subString, replacement) {
  checkType(string, "string");
  checkType(subString, "string");
  checkType(replacement, "string");
  return string.replaceAll(subString, () => replacement);
}
function replaceFirst(string, subString, replacement) {
  checkType(string, "string");
  checkType(subString, "string");
  checkType(replacement, "string");
  return string.replace(subString, () => replacement);
}
function startsWith(string, prefix) {
  checkType(string, "string");
  checkType(prefix, "string");
  return string.startsWith(prefix);
}
function endsWith(string, prefix) {
  checkType(string, "string");
  checkType(prefix, "string");
  return string.endsWith(prefix);
}
function has9(string, subString) {
  checkType(string, "string");
  checkType(subString, "string");
  return string.includes(subString);
}
function indexOf4(string, subString) {
  checkType(string, "string");
  const index = string.indexOf(subString);
  return index >= 0 ? index : null;
}
function padLeft(value, n) {
  checkType(n, "number");
  checkWhole(n);
  checkPositive(n);
  return show(value).padStart(n);
}
function padRight(value, n) {
  checkType(n, "number");
  checkWhole(n);
  checkPositive(n);
  return show(value).padEnd(n);
}
function trim(string) {
  checkType(string, "string");
  return string.trim();
}
function trimLeft(string) {
  checkType(string, "string");
  return string.trimStart();
}
function trimRight(string) {
  checkType(string, "string");
  return string.trimEnd();
}
function toUpper(string) {
  checkType(string, "string");
  return string.toUpperCase();
}
function toLower(string) {
  checkType(string, "string");
  return string.toLowerCase();
}
function isUpper(string) {
  return toUpper(string) === string;
}
function isLower(string) {
  return toLower(string) === string;
}
function isAlpha(string) {
  checkType(string, "string");
  return /^\p{L}*$/u.test(string);
}
function isAlphaNum(string) {
  checkType(string, "string");
  return /^(\p{L}|\p{N})*$/u.test(string);
}
function isDigit(string) {
  checkType(string, "string");
  return /^\p{N}*$/u.test(string);
}
function isAsciiAlpha(string) {
  checkType(string, "string");
  return /^[a-zA-Z]*$/.test(string);
}
function isAsciiAlphaNum(string) {
  checkType(string, "string");
  return /^[a-zA-Z0-9]*$/.test(string);
}
function isAsciiDigit(string) {
  checkType(string, "string");
  return /^[0-9]*$/.test(string);
}
function parse3(string) {
  checkType(string, "string");
  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    case "none":
      return null;
  }
  const result = Number(string);
  if (string !== "" && !Number.isNaN(result)) {
    return result;
  }
  throw new Panic("cannot parse string", {
    string
  });
}
var newline;
var init_Str = __esm({
  "std/Str.js"() {
    init_values();
    init_num();
    init_list();
    init_repr();
    init_panic();
    init_immutable();
    newline = /\r?\n/g;
  }
});

// std/Test.js
var Test_exports = {};
__export(Test_exports, {
  assert: () => assert,
  equals: () => equals3,
  returns: () => returns,
  runs: () => runs,
  throws: () => throws
});
function assert(predicate) {
  checkType(predicate, "boolean");
  if (!predicate) {
    throw new Panic("assertion error");
  }
  return null;
}
async function runs(func) {
  try {
    await func.call();
    return immutable_default.OrderedMap({
      status: "pass"
    });
  } catch (err) {
    return immutable_default.OrderedMap({
      status: "fail",
      panic: String(err)
    });
  }
}
function equals3(actual, expected) {
  if (immutable_default.is(actual, expected)) {
    return immutable_default.OrderedMap({
      status: "pass"
    });
  }
  return immutable_default.OrderedMap({
    status: "fail",
    expected,
    got: actual
  });
}
async function returns(func, expected) {
  try {
    const actual = await func.call();
    if (immutable_default.is(actual, expected)) {
      return immutable_default.OrderedMap({
        status: "pass"
      });
    }
    return immutable_default.OrderedMap({
      status: "fail",
      expected,
      got: actual
    });
  } catch (err) {
    return immutable_default.OrderedMap({
      status: "fail",
      panic: String(err)
    });
  }
}
async function throws(func, payload) {
  try {
    const returned = await func.call();
    return immutable_default.OrderedMap({
      status: "fail",
      returned
    });
  } catch (err) {
    if (err instanceof Err) {
      if (immutable_default.is(err.payload, payload)) {
        return immutable_default.OrderedMap({
          status: "pass"
        });
      }
      return immutable_default.OrderedMap({
        status: "fail",
        expected: payload,
        actual: err.payload
      });
    }
    return immutable_default.OrderedMap({
      status: "fail",
      panic: String(err)
    });
  }
}
var init_Test = __esm({
  "std/Test.js"() {
    init_values();
    init_panic();
    init_err();
    init_immutable();
  }
});

// node_modules/.deno/lodash.camelcase@4.3.0/node_modules/lodash.camelcase/index.js
var require_lodash = __commonJS({
  "node_modules/.deno/lodash.camelcase@4.3.0/node_modules/lodash.camelcase/index.js"(exports, module) {
    var INFINITY = 1 / 0;
    var symbolTag = "[object Symbol]";
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23";
    var rsComboSymbolsRange = "\\u20d0-\\u20f0";
    var rsDingbatRange = "\\u2700-\\u27bf";
    var rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
    var rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
    var rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
    var rsPunctuationRange = "\\u2000-\\u206f";
    var rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
    var rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]";
    var rsAstral = "[" + rsAstralRange + "]";
    var rsBreak = "[" + rsBreakRange + "]";
    var rsCombo = "[" + rsComboMarksRange + rsComboSymbolsRange + "]";
    var rsDigits = "\\d+";
    var rsDingbat = "[" + rsDingbatRange + "]";
    var rsLower = "[" + rsLowerRange + "]";
    var rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsUpper = "[" + rsUpperRange + "]";
    var rsZWJ = "\\u200d";
    var rsLowerMisc = "(?:" + rsLower + "|" + rsMisc + ")";
    var rsUpperMisc = "(?:" + rsUpper + "|" + rsMisc + ")";
    var rsOptLowerContr = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?";
    var rsOptUpperContr = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [
      rsNonAstral,
      rsRegional,
      rsSurrPair
    ].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsEmoji = "(?:" + [
      rsDingbat,
      rsRegional,
      rsSurrPair
    ].join("|") + ")" + rsSeq;
    var rsSymbol = "(?:" + [
      rsNonAstral + rsCombo + "?",
      rsCombo,
      rsRegional,
      rsSurrPair,
      rsAstral
    ].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptLowerContr + "(?=" + [
        rsBreak,
        rsUpper,
        "$"
      ].join("|") + ")",
      rsUpperMisc + "+" + rsOptUpperContr + "(?=" + [
        rsBreak,
        rsUpper + rsLowerMisc,
        "$"
      ].join("|") + ")",
      rsUpper + "?" + rsLowerMisc + "+" + rsOptLowerContr,
      rsUpper + "+" + rsOptUpperContr,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\xC7": "C",
      "\xE7": "c",
      "\xD0": "D",
      "\xF0": "d",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\xD1": "N",
      "\xF1": "n",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\xDD": "Y",
      "\xFD": "y",
      "\xFF": "y",
      "\xC6": "Ae",
      "\xE6": "ae",
      "\xDE": "Th",
      "\xFE": "th",
      "\xDF": "ss",
      // Latin Extended-A block.
      "\u0100": "A",
      "\u0102": "A",
      "\u0104": "A",
      "\u0101": "a",
      "\u0103": "a",
      "\u0105": "a",
      "\u0106": "C",
      "\u0108": "C",
      "\u010A": "C",
      "\u010C": "C",
      "\u0107": "c",
      "\u0109": "c",
      "\u010B": "c",
      "\u010D": "c",
      "\u010E": "D",
      "\u0110": "D",
      "\u010F": "d",
      "\u0111": "d",
      "\u0112": "E",
      "\u0114": "E",
      "\u0116": "E",
      "\u0118": "E",
      "\u011A": "E",
      "\u0113": "e",
      "\u0115": "e",
      "\u0117": "e",
      "\u0119": "e",
      "\u011B": "e",
      "\u011C": "G",
      "\u011E": "G",
      "\u0120": "G",
      "\u0122": "G",
      "\u011D": "g",
      "\u011F": "g",
      "\u0121": "g",
      "\u0123": "g",
      "\u0124": "H",
      "\u0126": "H",
      "\u0125": "h",
      "\u0127": "h",
      "\u0128": "I",
      "\u012A": "I",
      "\u012C": "I",
      "\u012E": "I",
      "\u0130": "I",
      "\u0129": "i",
      "\u012B": "i",
      "\u012D": "i",
      "\u012F": "i",
      "\u0131": "i",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u0138": "k",
      "\u0139": "L",
      "\u013B": "L",
      "\u013D": "L",
      "\u013F": "L",
      "\u0141": "L",
      "\u013A": "l",
      "\u013C": "l",
      "\u013E": "l",
      "\u0140": "l",
      "\u0142": "l",
      "\u0143": "N",
      "\u0145": "N",
      "\u0147": "N",
      "\u014A": "N",
      "\u0144": "n",
      "\u0146": "n",
      "\u0148": "n",
      "\u014B": "n",
      "\u014C": "O",
      "\u014E": "O",
      "\u0150": "O",
      "\u014D": "o",
      "\u014F": "o",
      "\u0151": "o",
      "\u0154": "R",
      "\u0156": "R",
      "\u0158": "R",
      "\u0155": "r",
      "\u0157": "r",
      "\u0159": "r",
      "\u015A": "S",
      "\u015C": "S",
      "\u015E": "S",
      "\u0160": "S",
      "\u015B": "s",
      "\u015D": "s",
      "\u015F": "s",
      "\u0161": "s",
      "\u0162": "T",
      "\u0164": "T",
      "\u0166": "T",
      "\u0163": "t",
      "\u0165": "t",
      "\u0167": "t",
      "\u0168": "U",
      "\u016A": "U",
      "\u016C": "U",
      "\u016E": "U",
      "\u0170": "U",
      "\u0172": "U",
      "\u0169": "u",
      "\u016B": "u",
      "\u016D": "u",
      "\u016F": "u",
      "\u0171": "u",
      "\u0173": "u",
      "\u0174": "W",
      "\u0175": "w",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "\u0179": "Z",
      "\u017B": "Z",
      "\u017D": "Z",
      "\u017A": "z",
      "\u017C": "z",
      "\u017E": "z",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0152": "Oe",
      "\u0153": "oe",
      "\u0149": "'n",
      "\u017F": "ss"
    };
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array ? array.length : 0;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? void 0 : object[key];
      };
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var Symbol2 = root.Symbol;
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function baseSlice(array, start, end) {
      var index = -1, length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : length + start;
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : end - start >>> 0;
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === void 0 ? length : end;
      return !start && end >= length ? array : baseSlice(array, start, end);
    }
    function createCaseFirst(methodName) {
      return function(string) {
        string = toString5(string);
        var strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
        var chr = strSymbols ? strSymbols[0] : string.charAt(0);
        var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
        return chr[methodName]() + trailing;
      };
    }
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
      };
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toString5(value) {
      return value == null ? "" : baseToString(value);
    }
    var camelCase3 = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? capitalize(word) : word);
    });
    function capitalize(string) {
      return upperFirst(toString5(string).toLowerCase());
    }
    function deburr(string) {
      string = toString5(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
    }
    var upperFirst = createCaseFirst("toUpperCase");
    function words(string, pattern, guard) {
      string = toString5(string);
      pattern = guard ? void 0 : pattern;
      if (pattern === void 0) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    module.exports = camelCase3;
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = [
      "nodebuffer",
      "arraybuffer",
      "fragments"
    ];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat2(list2, totalLength) {
      if (list2.length === 0) return EMPTY_BUFFER;
      if (list2.length === 1) return list2[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list2.length; i++) {
        const buf = list2[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat: concat2,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e2) {
      }
    }
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("node:zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([
      0,
      0,
      255,
      255
    ]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       * @param {Boolean} [isServer=false] Create the instance in either server or
       *     client mode
       * @param {Number} [maxPayload=0] The maximum allowed message length
       */
      constructor(options3, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options3 || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(new Error("The deflate stream was closed while data was being processed"));
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("node:buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code2) {
      return code2 >= 1e3 && code2 <= 1014 && code2 !== 1004 && code2 !== 1005 && code2 !== 1006 || code2 >= 3e3 && code2 <= 4999;
    }
    function _isValidUTF8(buf) {
      const len6 = buf.length;
      let i = 0;
      while (i < len6) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len6 || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len6 || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len6 || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e2) {
      }
    }
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("node:stream");
    var PerMessageDeflate = require_permessage_deflate();
    var { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require_constants();
    var { concat: concat2, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options3 = {}) {
        super();
        this._allowSynchronousEvents = options3.allowSynchronousEvents !== void 0 ? options3.allowSynchronousEvents : true;
        this._binaryType = options3.binaryType || BINARY_TYPES[0];
        this._extensions = options3.extensions || {};
        this._isServer = !!options3.isServer;
        this._maxPayload = options3.maxPayload | 0;
        this._skipUTF8Validation = !!options3.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error2 = this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
          cb(error2);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error2 = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
          cb(error2);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error2 = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
            cb(error2);
            return;
          }
          if (!this._fragmented) {
            const error2 = this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
            cb(error2);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error2 = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
            cb(error2);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error2 = this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
            cb(error2);
            return;
          }
          if (compressed) {
            const error2 = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
            cb(error2);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error2 = this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
            cb(error2);
            return;
          }
        } else {
          const error2 = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
          cb(error2);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error2 = this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
            cb(error2);
            return;
          }
        } else if (this._masked) {
          const error2 = this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
          cb(error2);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error2 = this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
          cb(error2);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error2 = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
            cb(error2);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error2 = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
              cb(error2);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat2(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat2(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat2(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error2 = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
            cb(error2);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code2 = data.readUInt16BE(0);
            if (!isValidStatusCode(code2)) {
              const error2 = this.createError(RangeError, `invalid status code ${code2}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
              cb(error2);
              return;
            }
            const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error2 = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
              cb(error2);
              return;
            }
            this._loop = false;
            this.emit("conclude", code2, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("node:stream");
    var { randomFillSync } = __require("node:crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options3) {
        let mask;
        let merge6 = false;
        let offset = 2;
        let skipMasking = false;
        if (options3.mask) {
          mask = options3.maskBuffer || maskBuffer;
          if (options3.generateMask) {
            options3.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options3.mask || skipMasking) && options3[kByteLength] !== void 0) {
            dataLength = options3[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge6 = options3.mask && options3.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge6 ? dataLength + offset : offset);
        target[0] = options3.fin ? options3.opcode | 128 : options3.opcode;
        if (options3.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options3.mask) return [
          target,
          data
        ];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [
          target,
          data
        ];
        if (merge6) {
          applyMask(data, mask, target, offset, dataLength);
          return [
            target
          ];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [
          target,
          data
        ];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code2, data, mask, cb) {
        let buf;
        if (code2 === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code2 !== "number" || !isValidStatusCode(code2)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code2, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code2, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options3 = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([
            this.dispatch,
            buf,
            false,
            options3,
            cb
          ]);
        } else {
          this.sendFrame(_Sender.frame(buf, options3), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options3 = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([
              this.getBlobData,
              data,
              false,
              options3,
              cb
            ]);
          } else {
            this.getBlobData(data, false, options3, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([
            this.dispatch,
            data,
            false,
            options3,
            cb
          ]);
        } else {
          this.sendFrame(_Sender.frame(data, options3), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options3 = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([
              this.getBlobData,
              data,
              false,
              options3,
              cb
            ]);
          } else {
            this.getBlobData(data, false, options3, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([
            this.dispatch,
            data,
            false,
            options3,
            cb
          ]);
        } else {
          this.sendFrame(_Sender.frame(data, options3), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options3, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options3.binary ? 2 : 1;
        let rsv1 = options3.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options3.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options3.fin,
          generateMask: this._generateMask,
          mask: options3.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([
              this.getBlobData,
              data,
              this._compress,
              opts,
              cb
            ]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([
            this.dispatch,
            data,
            this._compress,
            opts,
            cb
          ]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options3, cb) {
        this._bufferedBytes += options3[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error("The socket was closed while the blob was being read");
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options3[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options3), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options3, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options3, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options3), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options3[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options3.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error("The socket was closed while data was being compressed");
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options3[kByteLength];
          this._state = DEFAULT;
          options3.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options3), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list2, cb) {
        if (list2.length === 2) {
          this._socket.cork();
          this._socket.write(list2[0]);
          this._socket.write(list2[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list2[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", {
      enumerable: true
    });
    Object.defineProperty(Event.prototype, "type", {
      enumerable: true
    });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options3 = {}) {
        super(type);
        this[kCode] = options3.code === void 0 ? 0 : options3.code;
        this[kReason] = options3.reason === void 0 ? "" : options3.reason;
        this[kWasClean] = options3.wasClean === void 0 ? false : options3.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", {
      enumerable: true
    });
    Object.defineProperty(CloseEvent.prototype, "reason", {
      enumerable: true
    });
    Object.defineProperty(CloseEvent.prototype, "wasClean", {
      enumerable: true
    });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options3 = {}) {
        super(type);
        this[kError] = options3.error === void 0 ? null : options3.error;
        this[kMessage] = options3.message === void 0 ? "" : options3.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", {
      enumerable: true
    });
    Object.defineProperty(ErrorEvent.prototype, "message", {
      enumerable: true
    });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options3 = {}) {
        super(type);
        this[kData] = options3.data === void 0 ? null : options3.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", {
      enumerable: true
    });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options3 = {}) {
        for (const listener of this.listeners(type)) {
          if (!options3[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code2, message) {
            const event = new CloseEvent("close", {
              code: code2,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error2) {
            const event = new ErrorEvent("error", {
              error: error2,
              message: error2.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options3[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options3.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push3(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [
        elem
      ];
      else dest[name].push(elem);
    }
    function parse4(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code2 = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code2 = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code2 === 32 || code2 === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code2 === 44) {
              push3(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (code2 === 32 || code2 === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push3(params, header.slice(start, end), true);
            if (code2 === 44) {
              push3(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code2 === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code2] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code2] === 1) {
              if (start === -1) start = i;
            } else if (code2 === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code2 === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code2 === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code2 === 32 || code2 === 9)) {
            if (end === -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push3(params, paramName, value);
            if (code2 === 44) {
              push3(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code2 === 32 || code2 === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push3(offers, token, params);
      } else {
        if (paramName === void 0) {
          push3(params, token, true);
        } else if (mustUnescape) {
          push3(params, paramName, token.replace(/\\/g, ""));
        } else {
          push3(params, paramName, token);
        }
        push3(offers, extensionName, params);
      }
      return offers;
    }
    function format2(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations)) configurations = [
          configurations
        ];
        return configurations.map((params) => {
          return [
            extension
          ].concat(Object.keys(params).map((k) => {
            let values3 = params[k];
            if (!Array.isArray(values3)) values3 = [
              values3
            ];
            return values3.map((v) => v === true ? k : `${k}=${v}`).join("; ");
          })).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = {
      format: format2,
      parse: parse4
    };
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("node:events");
    var https = __require("node:https");
    var http2 = __require("node:http");
    var net = __require("node:net");
    var tls = __require("node:tls");
    var { randomBytes, createHash } = __require("node:crypto");
    var { Duplex, Readable } = __require("node:stream");
    var { URL } = __require("node:url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var { BINARY_TYPES, EMPTY_BUFFER, GUID, kForOnEventAttribute, kListener, kStatusCode, kWebSocket, NOOP } = require_constants();
    var { EventTarget: { addEventListener, removeEventListener } } = require_event_target();
    var { format: format2, parse: parse4 } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [
      8,
      13
    ];
    var readyStates = [
      "CONNECTING",
      "OPEN",
      "CLOSING",
      "CLOSED"
    ];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options3) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options3 = protocols;
              protocols = [];
            } else {
              protocols = [
                protocols
              ];
            }
          }
          initAsClient(this, address, protocols, options3);
        } else {
          this._autoPong = options3.autoPong;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options3) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options3.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options3.maxPayload,
          skipUTF8Validation: options3.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options3.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code2, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code2, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options3, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options3 === "function") {
          cb = options3;
          options3 = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options3
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, {
        enumerable: true
      });
    });
    [
      "open",
      "error",
      "close",
      "message"
    ].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options3) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options3,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e2) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http2.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(opts.perMessageDeflate !== true ? opts.perMessageDeflate : {}, false, opts.maxPayload);
        opts.headers["Sec-WebSocket-Extensions"] = format2({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError("An invalid or duplicated subprotocol was specified");
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options3 && options3.headers;
          options3 = {
            ...options3,
            headers: {}
          };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options3.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options3.headers.authorization) {
          options3.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e2) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options3);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse4(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options3) {
      options3.path = options3.socketPath;
      return net.connect(options3);
    }
    function tlsConnect(options3) {
      options3.path = void 0;
      if (!options3.servername && options3.servername !== "") {
        options3.servername = net.isIP(options3.host) ? "" : options3.host;
      }
      return tls.connect(options3);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code2, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code2;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code2 === 1005) websocket.close();
      else websocket.close(code2, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(websocket._socket.destroy.bind(websocket._socket), closeTimeout);
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("node:stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options3) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options3,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error2(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error2(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open2() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open2() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse4(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code2 = header.charCodeAt(i);
        if (end === -1 && tokenChars[code2] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code2 === 32 || code2 === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code2 === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = {
      parse: parse4
    };
  }
});

// node_modules/.deno/ws@8.18.3/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/.deno/ws@8.18.3/node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("node:events");
    var http2 = __require("node:http");
    var { Duplex } = __require("node:stream");
    var { createHash } = __require("node:crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options3, callback) {
        super();
        options3 = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options3
        };
        if (options3.port == null && !options3.server && !options3.noServer || options3.port != null && (options3.server || options3.noServer) || options3.server && options3.noServer) {
          throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');
        }
        if (options3.port != null) {
          this._server = http2.createServer((req, res) => {
            const body = http2.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(options3.port, options3.host, options3.backlog, callback);
        } else if (options3.server) {
          this._server = options3.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options3.perMessageDeflate === true) options3.perMessageDeflate = {};
        if (options3.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options3;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version2 = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version2 !== 13 && version2 !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code2, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code2 || 401, message, headers);
              }
              this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [
              params
            ]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map4) {
      for (const event of Object.keys(map4)) server.on(event, map4[event]);
      return function removeListeners() {
        for (const event of Object.keys(map4)) {
          server.removeListener(event, map4[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code2, message, headers) {
      message = message || http2.STATUS_CODES[code2];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(`HTTP/1.1 ${code2} ${http2.STATUS_CODES[code2]}\r
` + Object.keys(headers).map((h2) => `${h2}: ${headers[h2]}`).join("\r\n") + "\r\n\r\n" + message);
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code2, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code2, message, headers);
      }
    }
  }
});

// src/import.js
init_panic();

// src/keywords.js
var keywords = [
  "and",
  "arg",
  "case",
  "do",
  "elif",
  "else",
  "end",
  "false",
  "fn",
  "for",
  "if",
  "import",
  "in",
  "match",
  "none",
  "not",
  "or",
  "return",
  "then",
  "true",
  "while"
];

// src/parser.js
init_num();
init_panic();
var skip2 = [
  "whitespace",
  "newline",
  "comment"
];
var identifier = [
  "name",
  ...keywords
];
var def = [
  "=",
  "|=",
  "$=",
  "?=",
  "+=",
  "-=",
  "*=",
  "/=",
  "**=",
  "%="
];
var ops = [
  [
    "or"
  ],
  [
    "and"
  ],
  [
    "in",
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">="
  ],
  [
    "+",
    "-"
  ],
  [
    "*",
    "/",
    "%"
  ]
];
var escapeSeq = /\\["\\nrt]|\\u{([\dA-Fa-f]{1,6})}/g;
var stringInner = /^r?#*"([\s\S]*)"#*$/;
var indent2 = /^[ ]*/;
var fmtVar = /\$(?:[_a-zA-Z]\w*(?:\.[_a-zA-Z]\w*)*|\([_a-zA-Z]\w*(?:\.[_a-zA-Z]\w*)*\))/g;
function parseStr(string, loc) {
  return string.replaceAll(escapeSeq, (match3, code2, index) => {
    switch (match3) {
      case "\\\\":
        return "\\";
      case '\\"':
        return '"';
      case "\\n":
        return "\n";
      case "\\r":
        return "\r";
      case "\\t":
        return "	";
    }
    try {
      return String.fromCodePoint(parseInt(code2, 16));
    } catch (_) {
      loc = loc.next('"' + string.slice(0, index) + "\\u{");
      throw new Panic("invaild code point", {
        $code: `'${code2}'`
      }, loc);
    }
  });
}
var Node = class {
  constructor(type, loc, value) {
    this.type = type;
    this.loc = loc;
    this.value = value;
  }
};
function unexpectedToken(token, details = {}) {
  if (token.type === "endOfFile") {
    throw new Panic("unexpected end-of-file", {}, token.loc);
  }
  return new Panic("unexpected token", {
    $token: token.value,
    ...details
  }, token.loc);
}
function parse2(tokens) {
  tokens.forEach((token) => token.validate());
  const parser2 = new Parser(tokens);
  const statements = parser2.getStatements(true);
  parser2.get("endOfFile");
  return statements;
}
var Parser = class {
  index = 0;
  fnDepth = 0;
  implicits = [];
  locals = [];
  constructor(tokens) {
    this.tokens = tokens;
  }
  *upcomingTokens() {
    for (let index = this.index; index < this.tokens.length; index++) {
      yield this.tokens[index];
    }
  }
  // check type of next token
  has(...types) {
    for (const token of this.upcomingTokens()) {
      if (token.matches(...types)) {
        return true;
      }
      if (!token.matches(...skip2)) {
        break;
      }
    }
    return false;
  }
  // check types of next tokens
  hasMulti(...types) {
    for (const token of this.upcomingTokens()) {
      if (!types.length) {
        return true;
      }
      if (token.matches(types[0])) {
        types.shift();
      } else if (!token.matches(...skip2)) {
        return false;
      }
    }
    return false;
  }
  // advance parser and get the next matching token
  // (throw an error if next token has the wrong type)
  get(...types) {
    for (const token of this.upcomingTokens()) {
      this.index++;
      if (token.matches(...types)) {
        return token;
      }
      if (!token.matches(...skip2)) {
        throw unexpectedToken(token, types.length === 1 ? {
          $expected: types[0]
        } : {});
      }
    }
  }
  // get the next non-skip token without advancing the parser
  peek() {
    for (const token of this.upcomingTokens()) {
      if (!token.matches(...skip2)) {
        return token;
      }
    }
  }
  updateImplicit(name, loc) {
    if (name === "arg") {
      if (!this.implicits.length) {
        throw new Panic("pipeline placeholder cannot be used here", {}, loc);
      }
      this.implicits[this.implicits.length - 1] ??= loc;
    }
  }
  addLocal(name) {
    this.locals.at(-1)?.add(name);
  }
  // get a sequence of elements (using the handler method),
  // with given start, end, and separator token types
  // a trailing separator is allowed
  seq(start, end, sep, handler) {
    const elems = [];
    this.get(start);
    while (!this.has(end)) {
      elems.push(handler.call(this));
      if (!this.has(end)) {
        this.get(sep);
      }
    }
    this.get(end);
    return elems;
  }
  getName() {
    const { value, loc } = this.get("name", "arg");
    this.updateImplicit(value, loc);
    return new Node("name", loc, value);
  }
  getNumber() {
    const { value, loc } = this.get("number");
    const n = checkNumResult(Number(value));
    return new Node("number", loc, n);
  }
  getNone() {
    const { loc } = this.get("none");
    return new Node("none", loc, null);
  }
  getBool() {
    const { value, loc } = this.get("true", "false");
    return new Node("bool", loc, value === "true");
  }
  getStringInner(string) {
    return string.match(stringInner)[1];
  }
  getAligned(value) {
    value = this.getStringInner(value);
    if (!value.includes("\n")) {
      return value;
    }
    const lines2 = value.split(/\r?\n/);
    let minIndent = lines2.at(-1).match(indent2)[0].length;
    if (lines2[0].trim() === "") {
      lines2.shift();
    }
    if (lines2.at(-1).trim() === "") {
      lines2.pop();
    }
    for (const line of lines2) {
      const newIndent = line.match(indent2)[0].length;
      if (newIndent < line.length) {
        minIndent = Math.min(minIndent, newIndent);
      }
    }
    return lines2.map((line) => line.slice(minIndent).trimEnd()).join("\n");
  }
  getFmt(value, loc) {
    const rawFragments = value.split(fmtVar);
    const fmtVars = value.match(fmtVar);
    const fragments = [];
    const fmtNodes = [];
    let innerLoc = loc.next('"');
    for (const [index, varStr] of fmtVars.entries()) {
      fragments.push(parseStr(rawFragments[index], innerLoc));
      const fmtInner = varStr.startsWith("$(") ? varStr.slice(2, -1) : varStr.slice(1);
      const varSegments = fmtInner.split(".");
      const name = varSegments[0];
      innerLoc = innerLoc.next(rawFragments[index], "$");
      this.updateImplicit(name, innerLoc);
      let fmtNode = new Node("name", innerLoc, name);
      innerLoc = innerLoc.next(name);
      for (const segment of varSegments.slice(1)) {
        fmtNode = new Node("access", innerLoc, {
          lhs: fmtNode,
          rhs: new Node("string", innerLoc, segment)
        });
        innerLoc = innerLoc.next(".", segment);
      }
      fmtNodes.push(fmtNode);
    }
    fragments.push(parseStr(rawFragments.at(-1), innerLoc));
    return new Node("fmtString", loc, {
      fragments,
      fmtNodes
    });
  }
  getString() {
    const { value, loc } = this.get("string");
    const aligned = this.getAligned(value);
    if (fmtVar.test(aligned)) {
      return this.getFmt(aligned, loc);
    }
    return new Node("string", loc, parseStr(aligned, loc));
  }
  getRawString() {
    const { value, loc } = this.get("rawString");
    const aligned = this.getAligned(value);
    return new Node("string", loc, aligned);
  }
  getList() {
    const { loc } = this.peek();
    const elems = this.seq("[", "]", ",", this.getExpression);
    return new Node("list", loc, elems);
  }
  getEntry() {
    if (this.has(...identifier)) {
      const { value: name, loc } = this.get(...identifier);
      const key2 = new Node("string", loc, name);
      if (this.has(",", "}")) {
        return {
          key: key2,
          value: new Node("name", loc, name)
        };
      }
      this.get(":");
      return {
        key: key2,
        value: this.getExpression()
      };
    }
    const key = this.getExpression();
    this.get(":");
    const value = this.getExpression();
    return {
      key,
      value
    };
  }
  getObject() {
    const { loc } = this.peek();
    const entries3 = this.seq("{", "}", ",", this.getEntry);
    return new Node("object", loc, entries3);
  }
  getParens() {
    this.get("(");
    const expression = this.getExpression();
    this.get(")");
    return expression;
  }
  getBase() {
    const token = this.peek();
    switch (token.type) {
      case "arg":
      case "name":
        return this.getName();
      case "number":
        return this.getNumber();
      case "string":
        return this.getString();
      case "rawString":
        return this.getRawString();
      case "true":
      case "false":
        return this.getBool();
      case "none":
        return this.getNone();
      case "[":
        return this.getList();
      case "{":
        return this.getObject();
      case "(":
        return this.getParens();
      default:
        throw unexpectedToken(token);
    }
  }
  getSuffix() {
    let lhs = this.getBase();
    while (this.has("field", "[", "(") && !this.has(...skip2)) {
      const { type, loc } = this.peek();
      switch (type) {
        case "field": {
          const key = this.get("field").value.slice(1);
          const rhs = new Node("string", loc, key);
          lhs = new Node("access", loc, {
            lhs,
            rhs
          });
          break;
        }
        case "[": {
          this.get("[");
          const rhs = this.getExpression();
          this.get("]");
          lhs = new Node("access", loc, {
            lhs,
            rhs
          });
          break;
        }
        case "(": {
          const args = this.seq("(", ")", ",", this.getExpression);
          lhs = new Node("call", loc, {
            args,
            func: lhs
          });
          break;
        }
      }
    }
    return lhs;
  }
  getFnDef() {
    const { loc } = this.get("fn");
    const name = this.get("name").value;
    const rhs = new Node("fn", loc, {
      name,
      ...this.getFnInner()
    });
    return new Node("def", loc, {
      name,
      keys: [],
      isCompound: false,
      rhs
    });
  }
  getReturn() {
    const { loc } = this.get("return");
    if (!this.fnDepth) {
      throw new Panic("Cannot use `return` outside of function", loc);
    }
    const value = this.has("elif", "else", "end") ? new Node("none", loc, null) : this.getExpression();
    return new Node("return", loc, value);
  }
  getRangeBody() {
    const range3 = this.getExpression();
    this.get("do");
    const body = this.getStatements();
    this.get("end");
    return {
      range: range3,
      body
    };
  }
  getFor() {
    const { loc } = this.get("for");
    if (this.hasMulti("name", "in")) {
      const name = this.get("name").value;
      this.addLocal(name);
      this.get("in");
      return new Node("for", loc, {
        name,
        ...this.getRangeBody()
      });
    }
    if (this.hasMulti("name", ",")) {
      const keyName = this.get("name").value;
      this.addLocal(keyName);
      this.get(",");
      const valName = this.get("name").value;
      this.addLocal(valName);
      this.get("in");
      return new Node("tandemFor", loc, {
        keyName,
        valName,
        ...this.getRangeBody()
      });
    }
    return new Node("anonFor", loc, this.getRangeBody());
  }
  getWhile() {
    const { loc } = this.get("while");
    const cond = this.getExpression();
    this.get("do");
    const body = this.getStatements();
    this.get("end");
    return new Node("while", loc, {
      cond,
      body
    });
  }
  unrollKeys(node) {
    const keys3 = [];
    while (node.type === "access") {
      keys3.push(node.value.rhs);
      node = node.value.lhs;
    }
    keys3.reverse();
    return {
      base: node,
      keys: keys3
    };
  }
  getAssign(symbols2) {
    const { value, loc } = this.get(...symbols2);
    let op = value;
    if (op.length > 1 && op.endsWith("=")) {
      op = op.slice(0, -1);
    }
    switch (op) {
      case "|":
      case "$":
      case "?": {
        const rhs = this.getChain(new Node("prev", loc), this.getExpression, {
          value: op,
          loc
        });
        return {
          loc,
          rhs,
          isCompound: true
        };
      }
    }
    if (op !== "=") {
      const rhs = new Node("binaryOp", loc, {
        op,
        lhs: new Node("prev", loc),
        rhs: this.getExpression()
      });
      return {
        loc,
        rhs,
        isCompound: true
      };
    }
    return {
      loc,
      rhs: this.getExpression(),
      isCompound: false
    };
  }
  getDef() {
    const lhs = this.getExpression();
    if (this.has(...def)) {
      const { base, keys: keys3 } = this.unrollKeys(lhs);
      if (base.type !== "name") {
        throw new Panic("assignment target must be a variable name", {}, base.loc);
      }
      const name = base.value;
      this.addLocal(name);
      const { loc, isCompound, rhs } = this.getAssign(def);
      return new Node("def", loc, {
        name,
        keys: keys3,
        isCompound,
        rhs
      });
    }
    return lhs;
  }
  getStatement(topLevel = false) {
    if (this.hasMulti("fn", "name")) {
      const fnDef = this.getFnDef();
      if (!topLevel) {
        const { name, rhs } = fnDef.value;
        const paramStr = rhs.value.params.join(", ");
        const $solution = `use anon function syntax here instead: ${name} = fn(${paramStr}) ... end`;
        throw new Panic("function declarations can only occur at top level", {
          $solution
        }, fnDef.loc);
      }
      return fnDef;
    }
    const { type } = this.peek();
    switch (type) {
      case "return":
        return this.getReturn();
      case "for":
        return this.getFor();
      case "while":
        return this.getWhile();
    }
    return this.getDef();
  }
  getFnInner() {
    const params = this.seq("(", ")", ",", () => this.get("name").value);
    this.fnDepth++;
    this.locals.push(/* @__PURE__ */ new Set());
    const body = this.getStatements();
    const locals = this.locals.pop();
    this.fnDepth--;
    this.get("end");
    return {
      params,
      body,
      locals
    };
  }
  getStatements(topLevel = false) {
    const statements = [];
    while (!this.has("case", "elif", "else", "end", "endOfFile", "do")) {
      if (statements.length) {
        this.get("newline", ";");
      }
      statements.push(this.getStatement(topLevel));
    }
    return statements;
  }
  getFn() {
    const { loc } = this.get("fn");
    return new Node("fn", loc, {
      name: "fn",
      ...this.getFnInner()
    });
  }
  getBranch() {
    const cond = this.getExpression();
    this.get("then");
    const body = this.getStatements();
    return {
      cond,
      body
    };
  }
  getIf() {
    const { loc } = this.get("if");
    const branches = [
      this.getBranch()
    ];
    while (this.has("elif")) {
      this.get("elif");
      branches.push(this.getBranch());
    }
    let fallback;
    if (this.has("else")) {
      this.get("else");
      fallback = this.getStatements();
    }
    this.get("end");
    return new Node("if", loc, {
      branches,
      fallback
    });
  }
  getMatch() {
    const { loc } = this.get("match");
    const cond = this.getExpression();
    const cases = [];
    while (this.has("case")) {
      const patterns = this.seq("case", "then", ",", this.getExpression);
      const body = this.getStatements();
      cases.push({
        patterns,
        body
      });
    }
    let fallback;
    if (this.has("else")) {
      this.get("else");
      fallback = this.getStatements();
    }
    this.get("end");
    return new Node("match", loc, {
      cond,
      cases,
      fallback
    });
  }
  getImport() {
    const { loc } = this.get("import");
    const path2 = this.get("string").value.slice(1, -1);
    return new Node("import", loc, path2);
  }
  getUnary() {
    if (this.has("-", "not")) {
      const { type, loc } = this.get("-", "not");
      const rhs = this.getSuffix();
      return new Node("unaryOp", loc, {
        op: type,
        rhs
      });
    }
    return this.getSuffix();
  }
  getPrefix() {
    switch (this.peek().type) {
      case "fn":
        return this.getFn();
      case "if":
        return this.getIf();
      case "match":
        return this.getMatch();
      case "import":
        return this.getImport();
      default:
        return this.getUnary();
    }
  }
  getPow() {
    const hasParen = this.has("(");
    let lhs = this.getPrefix();
    while (this.has("**")) {
      const { loc } = this.get("**");
      const rhs = this.getPow();
      if (lhs.value.op === "-" && !hasParen) {
        throw new Panic("exponentiation of negated operand requires parentheses", {}, lhs.loc);
      }
      lhs = new Node("binaryOp", loc, {
        op: "**",
        lhs,
        rhs
      });
    }
    return lhs;
  }
  getLeftAssoc(precedence = 0) {
    if (precedence === ops.length) {
      return this.getPow();
    }
    let lhs = this.getLeftAssoc(precedence + 1);
    const types = ops[precedence];
    while (this.has(...types)) {
      if (this.has("-") && !(this.hasMulti("-", "whitespace") || this.hasMulti("-", "newline"))) {
        break;
      }
      const { type: op, loc } = this.get(...types);
      const rhs = this.getLeftAssoc(precedence + 1);
      lhs = new Node("binaryOp", loc, {
        op,
        lhs,
        rhs
      });
    }
    return lhs;
  }
  getChain(lhs, handler, op) {
    const nodeType = {
      "|": "pipe",
      $: "map",
      "?": "filter"
    }[op.value];
    this.implicits.push(void 0);
    const result = handler.call(this);
    const loc = this.implicits.pop();
    const rhs = loc ? new Node("fn", loc, {
      name: "fn",
      params: [
        "arg"
      ],
      body: [
        result
      ],
      locals: /* @__PURE__ */ new Set()
    }) : result;
    if (rhs.type === "call") {
      return new Node(nodeType, op.loc, {
        lhs,
        args: rhs.value.args,
        func: rhs.value.func
      });
    }
    return new Node(nodeType, op.loc, {
      lhs,
      args: [],
      func: rhs
    });
  }
  getExpression() {
    let lhs = this.getLeftAssoc();
    while (this.has("|", "$", "?")) {
      const op = this.get("|", "$", "?");
      lhs = this.getChain(lhs, this.getLeftAssoc, op);
    }
    return lhs;
  }
};

// src/tokenizer.js
init_panic();

// src/loc.js
var Loc = class _Loc {
  constructor(line, column, path2, getSource) {
    this.line = line;
    this.column = column;
    this.path = path2;
    this.getSource = getSource;
  }
  show(context) {
    const sourceLine = this.getSource().split("\n")[this.line - 1];
    const pointer = " ".repeat(this.column - 1) + "^";
    const pos = this.path ? `${this.path}:${this.line}:${this.column}` : `${this.line}:${this.column}`;
    context = context ? ` in ${context}` : "";
    return `${sourceLine}
${pointer}
At ${pos}${context}`;
  }
  next(...values3) {
    let { line, column } = this;
    for (const value of values3) {
      if (value.includes("\n")) {
        const lines2 = value.split("\n");
        line += lines2.length - 1;
        column = lines2.at(-1).length + 1;
      } else {
        column += value.length;
      }
    }
    return new _Loc(line, column, this.path, this.getSource);
  }
  sameLine(other2) {
    return this.line === other2.line && this.path === other2.path;
  }
};

// src/symbols.js
var symbols = [
  "}",
  "|=",
  "|",
  "{",
  "]",
  "[",
  "?=",
  "?",
  ">=",
  ">",
  "==",
  "=",
  "<=",
  "<",
  ";",
  ":",
  "/=",
  "/",
  "-=",
  "-",
  ",",
  "+=",
  "+",
  "*=",
  "**=",
  "**",
  "*",
  ")",
  "(",
  "%=",
  "%",
  "$=",
  "$",
  "!="
];

// src/tokenizer.js
function rule(name, pattern) {
  return {
    name,
    pattern: new RegExp(pattern.source, "y")
  };
}
function escape(chars2) {
  return chars2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var keywordRules = keywords.map((kwd) => rule(kwd, new RegExp(kwd + "\\b")));
var symbolRules = symbols.sort().reverse().map((sym) => rule(sym, new RegExp(escape(sym))));
var rules = [
  ...keywordRules,
  rule("field", /\.[a-zA-Z][a-zA-Z0-9]*/),
  rule("newline", /\r?\n/),
  rule("number", /\d*\.?\d+([eE][+-]?\d+)?/),
  // strings can contain newlines
  rule("string", /"(\\.|[^\\])*?"/),
  // rust-style raw strings
  // must come before name rule
  rule("rawString", /r(#*)"[^]*?"\1/),
  // unmatchedQuote rule must come after string rule
  rule("unmatchedQuote", /(r#*)?"/),
  rule("whitespace", /[ \t]+/),
  // name rule must come after keyword and raw string rules
  rule("name", /[a-zA-Z][a-zA-Z0-9]*/),
  // comment rule must come before '-' symbol rule
  rule("comment", /--.*/),
  ...symbolRules,
  // unexpectedCharacter rule must come last
  rule("unexpectedCharacter", /./)
];
var invalidEscape = /(?:^|[^\\])(?:\\\\)*(\\([^\\"nrtu]|u(?!{[0-9a-fA-F]{1,6}})))/;
var Token = class {
  constructor(type, loc, value) {
    this.type = type;
    this.loc = loc;
    this.value = value;
  }
  matches(...types) {
    return types.includes(this.type);
  }
  validate() {
    switch (this.type) {
      case "unmatchedQuote":
        throw new Panic("unmatched quote", {}, this.loc);
      case "unexpectedCharacter":
        throw new Panic("unexpected character", {
          character: this.value
        }, this.loc);
      case "string": {
        const match3 = this.value.match(invalidEscape);
        if (match3) {
          const prefix = this.value.slice(0, match3.index + match3[0].length - 1);
          const loc = this.loc.next(prefix);
          if (match3[1] == "\\u") {
            throw new Panic("invalid unicode escape sequence", {
              $expected: "'\\u{...}' where '...' is a sequence of between 1 and 6 hex digits"
            }, loc);
          }
          throw new Panic("invalid escape sequence", {
            $escape: `'${match3[1]}'`
          }, loc);
        }
      }
    }
  }
};
function tokenize(path2, source) {
  source = source.trimEnd();
  const tokens = [];
  let index = 0;
  let loc = new Loc(1, 1, path2, () => source);
  while (index < source.length) {
    for (const { name, pattern } of rules) {
      pattern.lastIndex = index;
      const value = pattern.exec(source)?.[0];
      if (value !== void 0) {
        index += value.length;
        tokens.push(new Token(name, loc, value));
        loc = loc.next(value);
        break;
      }
    }
  }
  tokens.push(new Token("endOfFile", loc, ""));
  return tokens;
}

// src/import.js
init_table();

// src/json.js
init_immutable();
function loadJson(string) {
  return convert2(JSON.parse(string));
}
function convert2(jsonVal) {
  if (Array.isArray(jsonVal)) {
    return immutable_default.List(jsonVal.map(convert2));
  }
  if (typeof jsonVal === "object") {
    const map4 = /* @__PURE__ */ new Map();
    for (const [key, value] of Object.entries(jsonVal)) {
      map4.set(key, convert2(value));
    }
    return immutable_default.OrderedMap(map4);
  }
  return jsonVal;
}

// src/std.js
init_values();
init_func();

// src/env.js
init_values();
init_func();
init_list();
init_obj();
init_num();
init_repr();
init_panic();
init_immutable();
import { dirname } from "node:path";
var Returner = class {
  constructor(value) {
    this.value = value;
  }
};
var Env = class _Env {
  constructor(parent, defs, locals = /* @__PURE__ */ new Set()) {
    this.parent = parent;
    this.defs = defs;
    this.locals = locals;
    this.prev = [];
    this.blameLocs = [];
  }
  spawn(defs = /* @__PURE__ */ new Map(), locals = /* @__PURE__ */ new Set()) {
    return new _Env(this, defs, locals);
  }
  snapshot() {
    const allDefs = [];
    let env2 = this;
    while (env2) {
      allDefs.push(env2.defs);
      env2 = env2.parent;
    }
    const entries3 = allDefs.toReversed().map((defs) => [
      ...defs
    ]).flat();
    return new _Env(void 0, new Map(entries3));
  }
  setBlame(loc) {
    this.blameLocs[this.blameLocs.length - 1] = loc;
  }
  // evaluate each node and return the value of the last one,
  // checking type if specified
  async evalLoc(nodes, loc, ...types) {
    if (!(nodes instanceof Array)) {
      nodes = [
        nodes
      ];
    }
    let result = null;
    for (const [index, node] of nodes.entries()) {
      try {
        this.blameLocs.push(null);
        result = await this.dispatch(node);
        if (index === nodes.length - 1) {
          checkType(result, ...types);
        }
      } catch (err) {
        if (err instanceof Panic) {
          err.setLoc(this.blameLocs.at(-1) ?? loc ?? node.loc);
        }
        throw err;
      } finally {
        this.blameLocs.pop();
      }
    }
    return result;
  }
  async eval(nodes, ...types) {
    return await this.evalLoc(nodes, void 0, ...types);
  }
  // evaluate each node and return a list of results
  async evalEach(nodes) {
    const results = [];
    for (const node of nodes) {
      results.push(await this.eval(node));
    }
    return results;
  }
  setDef(name, value) {
    this.defs.set(name, value);
  }
  lookup(name) {
    let env2 = this;
    while (env2) {
      if (env2.defs.has(name)) {
        return env2.defs.get(name);
      }
      if (env2.locals.has(name)) {
        throw new Panic("variable has not been defined yet", {
          $name: name
        });
      }
      env2 = env2.parent;
    }
    throw new Panic("variable is not defined", {
      $name: name
    });
  }
  async dispatch(node) {
    switch (node.type) {
      case "bool":
      case "none":
      case "number":
      case "string":
        return node.value;
      case "fmtString":
        return this.evalFmtString(node);
      case "unaryOp":
        return this.evalUnaryOp(node);
      case "binaryOp":
        return this.evalBinaryOp(node);
      case "name":
        return await this.lookup(node.value);
      case "def":
        return this.evalDef(node);
      case "prev":
        return this.prev.at(-1);
      case "call":
        return this.evalCall(node);
      case "pipe":
        return this.evalPipe(node);
      case "map":
        return this.evalMap(node);
      case "filter":
        return this.evalFilter(node);
      case "fn":
        return this.evalFn(node);
      case "return":
        throw new Returner(await this.eval(node.value));
      case "if":
        return this.evalIf(node);
      case "match":
        return this.evalMatch(node);
      case "for":
        return this.evalFor(node);
      case "tandemFor":
        return this.evalTandemFor(node);
      case "anonFor":
        return this.evalAnonFor(node);
      case "while":
        return this.evalWhile(node);
      case "list":
        return immutable_default.List(await this.evalEach(node.value));
      case "set":
        return immutable_default.OrderedSet(await this.evalEach(node.value));
      case "object":
        return this.evalObject(node);
      case "access":
        return this.evalAccess(node);
      case "import":
        return await getImport(dirname(node.loc.path), node.value);
      default:
        throw new Error("node.type: " + node.type);
    }
  }
  async evalFmtString(node) {
    const { fragments, fmtNodes } = node.value;
    let result = fragments[0];
    for (const [index, fragment] of fragments.slice(1).entries()) {
      const fmtValue = await this.eval(fmtNodes[index]);
      result += show(fmtValue) + fragment;
    }
    return result;
  }
  async evalUnaryOp(node) {
    const { op, rhs } = node.value;
    const value = await this.eval(rhs);
    switch (op) {
      case "-":
        return -checkType(value, "number");
      case "not":
        return !checkType(value, "boolean");
      default:
        throw new Error("op: " + op);
    }
  }
  async evalBinaryOp(node) {
    const { op, lhs, rhs } = node.value;
    switch (op) {
      case "and":
        return await this.eval(lhs, "boolean") && await this.eval(rhs, "boolean");
      case "or":
        return await this.eval(lhs, "boolean") || await this.eval(rhs, "boolean");
    }
    const a = await this.eval(lhs);
    const b = await this.eval(rhs);
    switch (op) {
      case "==":
        return immutable_default.is(a, b);
      case "!=":
        return !immutable_default.is(a, b);
      case "in":
        checkType(b, "list", "set", "object", "string", "table");
        switch (getType(b)) {
          case "list":
            return b.includes(a);
          case "set":
            return b.has(a);
          case "object":
            return b.has(a);
          case "string":
            checkType(a, "string");
            return b.includes(a);
          case "table":
            return b.has(a);
        }
        break;
      case "+": {
        const typeA = getType(a);
        checkType(b, typeA);
        switch (typeA) {
          case "string":
            return a + b;
          case "list":
          case "object":
          case "set":
          case "table":
            return a.concat(b);
        }
        break;
      }
      case "*": {
        switch (getType(a)) {
          case "number":
            if (getType(b) === "string") {
              checkType(a, "number");
              checkWhole(a);
              return b.repeat(Math.max(0, a));
            }
            break;
          case "string":
            checkType(b, "number");
            checkWhole(b);
            return a.repeat(Math.max(0, b));
          case "list":
            checkType(b, "number");
            checkWhole(b);
            return immutable_default.List(immutable_default.Repeat(a, b)).flatten(true);
        }
        break;
      }
      case "<":
      case "<=":
      case ">":
      case ">=":
        if (getType(a) === "string") {
          checkType(b, "string");
          switch (op) {
            case "<":
              return a < b;
            case "<=":
              return a <= b;
            case ">":
              return a > b;
            case ">=":
              return a >= b;
          }
        }
    }
    checkType(a, "number");
    checkType(b, "number");
    switch (op) {
      case "+":
        return checkNumResult(a + b, a, b);
      case "-":
        return checkNumResult(a - b, a, b);
      case "*":
        return checkNumResult(a * b, a, b);
      case "/":
        return checkNumResult(a / b, a, b);
      case "**":
        return checkNumResult(a ** b, a, b);
      case "%":
        return checkNumResult((a % b + b) % b, a, b);
      case "<":
        return a < b;
      case "<=":
        return a <= b;
      case ">":
        return a > b;
      case ">=":
        return a >= b;
      default:
        throw new Error("op: " + op);
    }
  }
  async sliceKeys(keys3) {
    const key = await this.eval(keys3[0]);
    const newKeys = keys3.slice(1);
    return {
      key,
      newKeys
    };
  }
  async updateList(list2, keys3, isCompound, rhs) {
    const { key, newKeys } = await this.sliceKeys(keys3);
    checkIndex(list2, key);
    const child = list2.get(key);
    const updated = await this.update(child, newKeys, isCompound, rhs);
    return list2.set(key, updated);
  }
  async updateObject(object, keys3, isCompound, rhs) {
    const { key, newKeys } = await this.sliceKeys(keys3);
    if (newKeys.length || isCompound) {
      checkKey(object, key);
    }
    const child = object.get(key);
    const updated = await this.update(child, newKeys, isCompound, rhs);
    return object.set(key, updated);
  }
  async updateTable(table, keys3, isCompound, rhs) {
    const { key, newKeys } = await this.sliceKeys(keys3);
    checkType(key, "number", "string", "object");
    let child;
    if (newKeys.length || isCompound) {
      child = table.get(key);
    }
    const updated = await this.update(child, newKeys, isCompound, rhs);
    this.setBlame(rhs.loc);
    return table.set(key, updated);
  }
  // recursively update a nested structure
  //
  // example:
  //   items[i].quantity += 1
  //
  // gets converted by the parser into:
  //   items[i].quantity = prev + 1
  //
  // gets interpreted by `update` as something like this:
  //   prev = items[i].quantity
  //   items = Obj.set(items, i, List.set(items[i], "quantity", prev + 1))
  async update(container, keys3, isCompound, rhs) {
    if (!keys3.length) {
      this.prev.push(container);
      const result = await this.eval(rhs);
      this.prev.pop();
      return result;
    }
    checkType(container, "list", "object", "table");
    this.setBlame(keys3[0].loc);
    switch (getType(container)) {
      case "list":
        return this.updateList(container, keys3, isCompound, rhs);
      case "object":
        return this.updateObject(container, keys3, isCompound, rhs);
      case "table":
        return this.updateTable(container, keys3, isCompound, rhs);
    }
  }
  async evalDef(node) {
    const { name, keys: keys3, isCompound, rhs } = node.value;
    if (!keys3.length) {
      this.prev.push(isCompound ? await this.lookup(name) : void 0);
      this.setDef(name, await this.eval(rhs));
      this.prev.pop();
    } else {
      const container = await this.lookup(name);
      this.setDef(name, await this.update(container, keys3, isCompound, rhs));
    }
    return null;
  }
  async evalCall(node) {
    const { func: funcNode, args: argNodes } = node.value;
    const func = await this.eval(funcNode, "function");
    const args = await this.evalEach(argNodes);
    return await func.call(...args);
  }
  async evalPipe(node) {
    const { lhs: lhsNode, args: argNodes, func: funcNode } = node.value;
    const lhs = await this.eval(lhsNode);
    const func = await this.eval(funcNode, "function");
    const args = await this.evalEach(argNodes);
    return await func.call(lhs, ...args);
  }
  async evalMap(node) {
    const { lhs, args: argNodes, func: funcNode } = node.value;
    const iter = await this.evalLoc(lhs, node.loc, "list", "table");
    const args = await this.evalEach(argNodes);
    const func = await this.eval(funcNode, "function");
    const elems = [];
    for (const elem of iter) {
      this.setBlame(funcNode.loc);
      elems.push(await func.call(elem, ...args));
    }
    return immutable_default.List(elems);
  }
  async evalFilter(node) {
    const { lhs, args: argNodes, func: funcNode } = node.value;
    const iter = await this.evalLoc(lhs, node.loc, "list", "table");
    if (!iter.size) {
      return iter;
    }
    const args = await this.evalEach(argNodes);
    const func = await this.eval(funcNode, "function");
    if (getType(iter) === "table") {
      return await iter.filter(func, args);
    }
    const elems = [];
    for (const elem of iter) {
      this.setBlame(funcNode.loc);
      if (await func.callCondition(elem, ...args)) {
        elems.push(elem);
      }
    }
    return immutable_default.List(elems);
  }
  evalFn(node) {
    const { name, params, body, locals } = node.value;
    const parent = name === "fn" ? this.snapshot() : this;
    const handler = async (...args) => {
      const defs = new Map(params.map((param, index) => [
        param,
        args[index]
      ]));
      const env2 = parent.spawn(defs, locals);
      try {
        return await env2.eval(body);
      } catch (err) {
        if (err instanceof Returner) {
          return err.value;
        }
        err.pushContext?.(context);
        throw err;
      }
    };
    const fn = new Func(handler, name, params);
    const context = String(fn);
    return fn;
  }
  async evalIf(node) {
    const { branches, fallback } = node.value;
    for (const { cond, body } of branches) {
      if (await this.eval(cond, "boolean")) {
        return await this.eval(body);
      }
    }
    return fallback ? await this.eval(fallback) : null;
  }
  async evalMatch(node) {
    const { cond: condNode, cases, fallback } = node.value;
    const cond = await this.eval(condNode);
    for (const { patterns, body } of cases) {
      for (const patternNode of patterns) {
        const pattern = await this.eval(patternNode);
        if (immutable_default.is(pattern, cond)) {
          return await this.eval(body);
        }
      }
    }
    return fallback ? await this.eval(fallback) : null;
  }
  async evalFor(node) {
    const { name, range: rangeNode, body } = node.value;
    const range3 = await this.eval(rangeNode, "list", "table", "object", "set");
    if (getType(range3) === "object") {
      for (const key of range3.keys()) {
        this.setDef(name, key);
        await this.eval(body);
      }
    } else {
      for (const value of range3) {
        this.setDef(name, value);
        await this.eval(body);
      }
    }
    return null;
  }
  async evalTandemFor(node) {
    const { keyName, valName, range: rangeNode, body } = node.value;
    const range3 = await this.eval(rangeNode, "list", "object", "table");
    if (getType(range3) === "object") {
      for (const [key, value] of range3) {
        this.setDef(keyName, key);
        this.setDef(valName, value);
        await this.eval(body);
      }
    } else {
      for (const [index, value] of range3.entries()) {
        this.setDef(keyName, index);
        this.setDef(valName, value);
        await this.eval(body);
      }
    }
    return null;
  }
  async evalAnonFor(node) {
    const { range: rangeNode, body } = node.value;
    const range3 = await this.eval(rangeNode, "number");
    this.setBlame(rangeNode.loc);
    checkWhole(range3);
    for (let n = 0; n < range3; n++) {
      await this.eval(body);
    }
    return null;
  }
  async evalWhile(node) {
    const { cond, body } = node.value;
    while (await this.eval(cond, "boolean")) {
      await this.eval(body);
    }
    return null;
  }
  async evalObject(node) {
    const map4 = /* @__PURE__ */ new Map();
    for (const { key: keyNode, value: valueNode } of node.value) {
      const key = await this.eval(keyNode);
      map4.set(key, await this.eval(valueNode));
    }
    return immutable_default.OrderedMap(map4);
  }
  async evalAccess(node) {
    const { lhs: lhsNode, rhs: rhsNode } = node.value;
    const lhs = await this.eval(lhsNode, "list", "object", "table");
    const rhs = await this.eval(rhsNode);
    switch (getType(lhs)) {
      case "list":
        this.setBlame(rhsNode.loc);
        checkIndex(lhs, rhs);
        return lhs.get(rhs);
      case "object":
        this.setBlame(rhsNode.loc);
        checkKey(lhs, rhs);
        return lhs.get(rhs);
      case "table":
        return lhs.get(rhs);
    }
  }
};

// src/std.js
init_immutable();
var std;
var modules;
var globals;
var variants;
var natives = {
  Async: await Promise.resolve().then(() => (init_Async(), Async_exports)),
  Bool: await Promise.resolve().then(() => (init_Bool(), Bool_exports)),
  Char: await Promise.resolve().then(() => (init_Char(), Char_exports)),
  Console: await Promise.resolve().then(() => (init_Console(), Console_exports)),
  Err: await Promise.resolve().then(() => (init_Err(), Err_exports)),
  Fs: await Promise.resolve().then(() => (init_Fs(), Fs_exports)),
  List: await Promise.resolve().then(() => (init_List(), List_exports)),
  Math: await Promise.resolve().then(() => (init_Math(), Math_exports)),
  None: await Promise.resolve().then(() => (init_None(), None_exports)),
  Obj: await Promise.resolve().then(() => (init_Obj(), Obj_exports)),
  Panic: await Promise.resolve().then(() => (init_Panic(), Panic_exports)),
  Rand: await Promise.resolve().then(() => (init_Rand(), Rand_exports)),
  Ref: await Promise.resolve().then(() => (init_Ref(), Ref_exports)),
  Re: await Promise.resolve().then(() => (init_Re(), Re_exports)),
  Set: await Promise.resolve().then(() => (init_Set(), Set_exports)),
  Str: await Promise.resolve().then(() => (init_Str(), Str_exports)),
  Table: await Promise.resolve().then(() => (init_Table(), Table_exports)),
  Test: await Promise.resolve().then(() => (init_Test(), Test_exports))
};
function makeModules() {
  modules = {};
  const paramChars = /\(([$\w\s,]*)\)/;
  for (const [modName, native] of Object.entries(natives)) {
    const mod = {};
    for (let [name, value] of Object.entries(native)) {
      if (name.startsWith("_")) {
        continue;
      }
      name = name.replaceAll("$", "");
      if (value instanceof Function) {
        const paramStr = value.toString().match(paramChars)[1].replaceAll(" ", "").replaceAll("$", "");
        const fullName = `${modName}.${name.replaceAll("$", "")}`;
        const params = paramStr.length ? paramStr.split(",") : [];
        value = new Func(value, fullName, params);
      }
      mod[name] = value;
    }
    modules[modName] = {};
    for (const name of Object.keys(mod).toSorted()) {
      modules[modName][name] = mod[name];
    }
  }
}
function makeGlobals() {
  globals = {
    assert: modules.Test.assert,
    chars: modules.Str.chars,
    clear: modules.Console.clear,
    join: modules.Str.join,
    max: modules.List.max,
    min: modules.List.min,
    parse: modules.Str.parse,
    print: modules.Console.print,
    prompt: modules.Console.prompt,
    range: modules.List.range,
    round: modules.Math.round,
    roundTo: modules.Math.roundTo,
    sleep: modules.Async.sleep,
    sort: modules.List.sort,
    sortDesc: modules.List.sortDesc,
    span: modules.List.span,
    split: modules.Str.split,
    sum: modules.List.sum
  };
}
function makeOverloads() {
  const overloads = {
    drop: [
      "values",
      "count"
    ],
    dropLast: [
      "values",
      "count"
    ],
    isEmpty: [
      "values"
    ],
    len: [
      "values"
    ],
    push: [
      "values",
      "item"
    ],
    remove: [
      "values",
      "elem"
    ],
    reverse: [
      "values"
    ],
    select: [
      "collection",
      "keys"
    ],
    sortBy: [
      "values",
      "ranker"
    ],
    sortDescBy: [
      "values",
      "ranker"
    ],
    take: [
      "values",
      "count"
    ],
    takeLast: [
      "values",
      "count"
    ]
  };
  const typesMap = {
    list: "List",
    none: "None",
    number: "Math",
    object: "Obj",
    set: "Set",
    string: "Str",
    table: "Table"
  };
  variants = {};
  modules.Overloads = {};
  for (const [name, params] of Object.entries(overloads)) {
    const types = [];
    variants[name] = [];
    for (const [type, modName] of Object.entries(typesMap)) {
      const value = modules[modName]?.[name];
      if (value) {
        variants[name].push(value);
        types.push(type);
      }
    }
    const handler = (...args) => {
      checkType(args[0], ...types);
      const modName = typesMap[getType(args[0])];
      return modules[modName][name].call(...args);
    };
    const fullName = `Overloads.${name}`;
    const overload = new Func(handler, fullName, params);
    globals[name] = overload;
    modules.Overloads[name] = overload;
  }
}
function makeStd() {
  const defs = {};
  for (const name of Object.keys(modules).toSorted()) {
    defs[name] = immutable_default.OrderedMap(modules[name]);
  }
  Object.assign(defs, globals);
  std = new Env(null, new Map(Object.entries(defs)));
}
function spawnStd() {
  if (!std) {
    makeModules();
    makeGlobals();
    makeOverloads();
    makeStd();
  }
  return std.spawn();
}

// src/import.js
init_immutable();
import { readFile as readFile3, realpath } from "node:fs/promises";
import { resolve as resolve2 } from "node:path";
var cache2 = /* @__PURE__ */ new Map();
var prefixChars = /^(?:([a-z]+):)?/;
async function evalProgram(statements) {
  return (await spawnStd()).eval(statements);
}
async function getImport(root, path2) {
  let prefix = path2.match(prefixChars)[1];
  if (prefix) {
    path2 = path2.slice(prefix.length + 1);
  } else {
    prefix = "";
  }
  const relPath = resolve2(root, path2);
  let absPath;
  try {
    absPath = await realpath(relPath);
  } catch {
    throw new Panic("cannot read file", {
      path: relPath
    });
  }
  const cachePath = `${prefix}:${absPath}`;
  if (cache2.has(cachePath)) {
    const result2 = cache2.get(cachePath);
    if (result2 === void 0) {
      throw new Panic("circular import", {
        path: relPath
      });
    }
    return result2;
  }
  cache2.set(cachePath, void 0);
  const result = await dispatch(prefix, relPath, absPath);
  cache2.set(cachePath, result);
  return result;
}
async function dispatch(prefix, relPath, absPath) {
  if (prefix === "raw") {
    return immutable_default.List(await readFile3(absPath));
  }
  const source = await readFile3(absPath, "utf8");
  switch (prefix) {
    case "text":
      return source;
    case "lines":
      return immutable_default.List(source.replace(/\r?\n^/, "").split(/\r?\n/g));
    case "csv":
      return Table.fromCsv(source);
    case "json":
      return loadJson(source);
    case "": {
      const statements = parse2(tokenize(relPath, source));
      return await evalProgram(statements);
    }
    default:
      throw new Panic("invalid import prefix", {
        prefix
      });
  }
}

// ptls.js
init_panic();

// repl/repl.js
init_prompt();
init_repr();
init_panic();
var env = await spawnStd();
async function repl() {
  while (true) {
    try {
      const input = await getLine(">> ");
      await runInput(input);
    } catch (err) {
      if (err instanceof Panic) {
        if (err.message === "EOF interrupt") {
          return;
        }
        console.log(String(err));
      } else {
        throw err;
      }
    }
  }
}
async function runInput(input) {
  const statements = parse2(tokenize("repl", input));
  for (const statement of statements) {
    const ans = await env.eval(statement);
    if (statement.type !== "def") {
      console.log(repr(ans));
      env.defs.set("ans", ans);
    }
  }
}

// site/build-scripts/highlight.js
function highlight(tokens) {
  return new Highlighter(tokens).annotated.join("");
}
var globals2 = /* @__PURE__ */ new Set([
  "Async",
  "Bool",
  "Char",
  "Console",
  "Err",
  "Fs",
  "List",
  "Math",
  "None",
  "Obj",
  "Overloads",
  "Rand",
  "Re",
  "Ref",
  "Set",
  "Str",
  "Table",
  "Test",
  "assert",
  "chars",
  "clear",
  "drop",
  "dropLast",
  "has",
  "isEmpty",
  "join",
  "len",
  "max",
  "min",
  "print",
  "prompt",
  "push",
  "range",
  "remove",
  "reverse",
  "round",
  "roundTo",
  "select",
  "sleep",
  "sort",
  "sortBy",
  "sortDesc",
  "sortDescBy",
  "span",
  "split",
  "sum",
  "take",
  "takeLast"
]);
var strInner = [
  {
    regex: /\$\([a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*\)/g,
    className: "interpolated"
  },
  {
    regex: /\$[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*/g,
    className: "interpolated"
  },
  {
    regex: /\\["\\nrt]|\\u{[\dA-Fa-f]{1,6}}/g,
    className: "escape"
  }
];
var identifier2 = /[a-zA-Z][a-zA-Z0-9]*/;
var classNames = {
  comment: "comment",
  number: "number",
  arg: "keyword",
  case: "keyword",
  do: "keyword",
  elif: "keyword",
  else: "keyword",
  end: "keyword",
  fn: "keyword",
  for: "keyword",
  if: "keyword",
  import: "keyword",
  in: "keyword",
  match: "keyword",
  return: "keyword",
  then: "keyword",
  while: "keyword",
  true: "constant",
  false: "constant",
  none: "constant",
  and: "operator",
  or: "operator",
  not: "operator",
  ">=": "operator",
  ">": "operator",
  "==": "operator",
  "=": "operator",
  "<=": "operator",
  "<": "operator",
  "/=": "operator",
  "/": "operator",
  "-=": "operator",
  "-": "operator",
  "+=": "operator",
  "+": "operator",
  "*=": "operator",
  "**=": "operator",
  "**": "operator",
  "*": "operator",
  "%=": "operator",
  "%": "operator",
  "!=": "operator"
};
var Highlighter = class {
  index = 0;
  constructor(tokens) {
    this.tokens = tokens;
    this.annotated = [];
    while (this.index < this.tokens.length) {
      this.advance();
    }
  }
  has(...types) {
    for (let index = this.index; index < this.tokens.length; index++) {
      const token = this.tokens[index];
      if (token.matches(...types)) {
        return true;
      }
      if (!token.matches("whitespace", "newline")) {
        return false;
      }
    }
  }
  next() {
    while (this.index < this.tokens.length) {
      const token = this.tokens[this.index];
      this.index++;
      if (token.matches("whitespace", "newline")) {
        this.add(token.value);
      } else {
        return token;
      }
    }
  }
  add(value, className = void 0) {
    const escaped2 = value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    if (className) {
      this.annotated.push(`<span class="${className}">${escaped2}</span>`);
    } else {
      this.annotated.push(escaped2);
    }
  }
  addNext(className = void 0) {
    this.add(this.next().value, className);
  }
  advance() {
    if (this.has("string")) {
      const chars2 = this.next().value.slice(1, -1);
      this.add(`"`, "quotes");
      let index = 0;
      while (index < chars2.length) {
        let next;
        for (const { regex, className } of strInner) {
          regex.lastIndex = index;
          const match3 = regex.exec(chars2);
          if (match3 && (!next || match3.index < next.match.index)) {
            next = {
              className,
              match: match3
            };
          }
        }
        if (next) {
          const { className, match: match3 } = next;
          if (match3.index > index) {
            this.add(chars2.slice(index, match3.index), "string");
          }
          this.add(match3[0], className);
          index = match3.index + match3[0].length;
        } else {
          this.add(chars2.slice(index), "string");
          index = chars2.length;
        }
      }
      this.add(`"`, "quotes");
      return;
    }
    if (this.has("rawString")) {
      const { value: value2 } = this.next();
      const prefixLen = value2.indexOf(`"`) + 1;
      this.add(value2.slice(0, prefixLen), "quotes");
      this.add(value2.slice(prefixLen, -prefixLen + 1), "string");
      this.add(value2.slice(-prefixLen + 1), "quotes");
      return;
    }
    if (this.has("field")) {
      const { value: value2 } = this.next();
      if (this.has("(")) {
        this.add(".");
        this.add(value2.slice(1), "call");
        this.addNext();
        return;
      }
      this.add(value2);
      return;
    }
    if (this.has("fn")) {
      this.addNext("keyword");
      if (this.has("name")) {
        this.addNext("function");
      }
      while (this.has("(", "name", ",")) {
        if (this.has("name")) {
          this.addNext("argument");
        } else {
          this.addNext();
        }
      }
      return;
    }
    if (this.has("|=", "|", "?=", "?", "$=", "$")) {
      this.addNext("operator");
      if (this.has("name")) {
        let last3 = this.next();
        while (this.has("field")) {
          if (globals2.has(last3.value)) {
            this.add(last3.value, "std");
          } else {
            this.add(last3.value);
          }
          last3 = this.next();
        }
        if (this.has("$", "(", ")", ",", ":", ";", "?", "]", "|", "newline", "comment", "elif", "else", "end", "endOfFile")) {
          if (last3.type === "name") {
            this.add(last3.value, "call");
          } else {
            this.add(".");
            this.add(last3.value.slice(1), "call");
          }
        } else {
          this.add(last3.value);
        }
      }
      return;
    }
    if (this.has("name")) {
      const { value: value2 } = this.next();
      if (this.has(":")) {
        this.add(value2);
        this.addNext();
        return;
      }
      if (this.has("(")) {
        this.add(value2, "call");
        this.addNext();
        return;
      }
      if (globals2.has(value2)) {
        this.add(value2, "std");
        return;
      }
      this.add(value2);
      return;
    }
    const { type, value } = this.next();
    if (identifier2.test(value) && this.has(":")) {
      this.add(value);
      return;
    }
    this.add(value, classNames[type]);
  }
};

// site/build-scripts/escape.js
function escapeHtml(string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function serialize(value, raw) {
  const flattened = typeof value?.[Symbol.iterator] === "function" ? [
    ...value
  ] : [
    value
  ];
  return raw ? flattened.map((val) => val ? val : "").join("") : escapeHtml(flattened.map(String).join(""));
}
function h(strings, ...values3) {
  let result = "";
  for (const [index, value] of values3.entries()) {
    const str = strings[index];
    result += str.endsWith("$") ? str.slice(0, -1) + serialize(value, true) : str + serialize(value, false);
  }
  return result + strings.at(-1);
}

// site/build-scripts/doc-std.js
init_values();
init_func();
init_panic();
init_repr();
function handleUnavailable() {
  throw new Panic("not available in notebook mode");
}
var unavailable = [
  "console",
  "fs",
  "async"
].map((s) => s + ".");
var shimConsole = {
  output: [],
  inputs: [],
  print(string, end = "\n") {
    this.output.push(string + end);
  },
  getOutput() {
    const result = this.output.join("");
    this.output = [];
    return result;
  }
};
var shims = {
  ["Console.write"](value) {
    checkType(value, "string");
    shimConsole.print(value, "");
    return value;
  },
  ["Console.error"](value) {
    shimConsole.print(show(value));
    return value;
  },
  ["Console.print"](value) {
    shimConsole.print(show(value));
    return value;
  },
  ["Console.debug"](value) {
    shimConsole.print(repr(value));
    return value;
  },
  ["Console.prompt"](message) {
    checkType(message, "string");
    const input = shimConsole.inputs.shift() ?? "";
    shimConsole.output.push(`${message}${input}
`);
    return input;
  }
};
function convert3(value) {
  if (getType(value) === "object") {
    return value.map(convert3);
  }
  if (getType(value) === "function") {
    if (shims[value.name]) {
      return new Func(shims[value.name], value.name, value.params);
    }
    for (const prefix of unavailable) {
      if (value.name.startsWith(prefix)) {
        return new Func(handleUnavailable, value.name, value.params);
      }
    }
  }
  return value;
}
var docStd;
async function spawnDocStd() {
  if (!docStd) {
    const std2 = await spawnStd();
    const defs = {};
    for (const [name, value] of std2.parent.defs) {
      defs[name] = convert3(value);
    }
    docStd = new Env(null, new Map(Object.entries(defs)));
  }
  return docStd.spawn();
}

// site/build-scripts/render-markdown.js
init_repr();

// node_modules/.deno/marked@15.0.12/node_modules/marked/lib/marked.esm.js
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
var noopTest = {
  exec: () => null
};
function edit(regex, opt = "") {
  let source = typeof regex === "string" ? regex : regex.source;
  const obj = {
    replace: (name, val) => {
      let valSource = typeof val === "string" ? val : val.source;
      valSource = valSource.replace(other.caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
var other = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (bull) => new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (indent3) => new RegExp(`^ {0,${Math.min(3, indent3 - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (indent3) => new RegExp(`^ {0,${Math.min(3, indent3 - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (indent3) => new RegExp(`^ {0,${Math.min(3, indent3 - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (indent3) => new RegExp(`^ {0,${Math.min(3, indent3 - 1)}}#`),
  htmlBeginRegex: (indent3) => new RegExp(`^ {0,${Math.min(3, indent3 - 1)}}<(?:[a-z].*>|!--)`, "i")
};
var newline2 = /^(?:[ \t]*(?:\n|$))+/;
var blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var bullet = /(?:[*+-]|\d{1,9}[.)])/;
var lheadingCore = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var lheading = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var lheadingGfm = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var blockText = /^[^\n]+/;
var _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
var def2 = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
var _tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var html = edit("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
var blockNormal = {
  blockquote,
  code: blockCode,
  def: def2,
  fences,
  heading,
  hr,
  html,
  lheading,
  list,
  newline: newline2,
  paragraph,
  table: noopTest,
  text: blockText
};
var gfmTable = edit("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockGfm = {
  ...blockNormal,
  lheading: lheadingGfm,
  table: gfmTable,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
};
var blockPedantic = {
  ...blockNormal,
  html: edit(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", _comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
};
var escape3 = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var br = /^( {2,}|\\)\n(?!\s*$)/;
var inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _punctuation = /[\p{P}\p{S}]/u;
var _punctuationOrSpace = /[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpace = /[^\s\p{P}\p{S}]/u;
var punctuation = edit(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, _punctuationOrSpace).getRegex();
var _punctuationGfmStrongEm = /(?!~)[\p{P}\p{S}]/u;
var _punctuationOrSpaceGfmStrongEm = /(?!~)[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpaceGfmStrongEm = /(?:[^\s\p{P}\p{S}]|~)/u;
var blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
var emStrongLDelimCore = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var emStrongLDelim = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuation).getRegex();
var emStrongLDelimGfm = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimAstCore = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var emStrongRDelimAst = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimAstGfm = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpaceGfmStrongEm).replace(/punctSpace/g, _punctuationOrSpaceGfmStrongEm).replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimUnd = edit("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var anyPunctuation = edit(/\\(punct)/, "gu").replace(/punct/g, _punctuation).getRegex();
var autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
var tag = edit("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
var link = edit(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
var nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
var reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
var inlineNormal = {
  _backpedal: noopTest,
  // only used for GFM url
  anyPunctuation,
  autolink,
  blockSkip,
  br,
  code: inlineCode,
  del: noopTest,
  emStrongLDelim,
  emStrongRDelimAst,
  emStrongRDelimUnd,
  escape: escape3,
  link,
  nolink,
  punctuation,
  reflink,
  reflinkSearch,
  tag,
  text: inlineText,
  url: noopTest
};
var inlinePedantic = {
  ...inlineNormal,
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
};
var inlineGfm = {
  ...inlineNormal,
  emStrongRDelimAst: emStrongRDelimAstGfm,
  emStrongLDelim: emStrongLDelimGfm,
  url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
var inlineBreaks = {
  ...inlineGfm,
  br: edit(br).replace("{2,}", "*").getRegex(),
  text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var block = {
  normal: blockNormal,
  gfm: blockGfm,
  pedantic: blockPedantic
};
var inline = {
  normal: inlineNormal,
  gfm: inlineGfm,
  breaks: inlineBreaks,
  pedantic: inlinePedantic
};
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape22(html2, encode) {
  if (encode) {
    if (other.escapeTest.test(html2)) {
      return html2.replace(other.escapeReplace, getEscapeReplacement);
    }
  } else {
    if (other.escapeTestNoEncode.test(html2)) {
      return html2.replace(other.escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html2;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(other.percentDecode, "%");
  } catch {
    return null;
  }
  return href;
}
function splitCells(tableRow, count3) {
  const row = tableRow.replace(other.findPipe, (match3, offset, str) => {
    let escaped2 = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\") escaped2 = !escaped2;
    if (escaped2) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(other.splitPipe);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells.at(-1)?.trim()) {
    cells.pop();
  }
  if (count3) {
    if (cells.length > count3) {
      cells.splice(count3);
    } else {
      while (cells.length < count3) cells.push("");
    }
  }
  for (; i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(other.slashPipe, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  if (level > 0) {
    return -2;
  }
  return -1;
}
function outputLink(cap, link2, raw, lexer2, rules2) {
  const href = link2.href;
  const title = link2.title || null;
  const text = cap[1].replace(rules2.other.outputLinkReplace, "$1");
  lexer2.state.inLink = true;
  const token = {
    type: cap[0].charAt(0) === "!" ? "image" : "link",
    raw,
    href,
    title,
    text,
    tokens: lexer2.inlineTokens(text)
  };
  lexer2.state.inLink = false;
  return token;
}
function indentCodeCompensation(raw, text, rules2) {
  const matchIndentToCode = raw.match(rules2.other.indentCodeCompensation);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(rules2.other.beginningSpace);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
}
var _Tokenizer = class {
  options;
  rules;
  // set by the lexer
  lexer;
  // set by the lexer
  constructor(options22) {
    this.options = options22 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "", this.rules);
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (this.rules.other.endingHash.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || this.rules.other.endingSpaceChar.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], "\n")
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines2 = rtrim(cap[0], "\n").split("\n");
      let raw = "";
      let text = "";
      const tokens = [];
      while (lines2.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i;
        for (i = 0; i < lines2.length; i++) {
          if (this.rules.other.blockquoteStart.test(lines2[i])) {
            currentLines.push(lines2[i]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines2[i]);
          } else {
            break;
          }
        }
        lines2 = lines2.slice(i);
        const currentRaw = currentLines.join("\n");
        const currentText = currentRaw.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text = text ? `${text}
${currentText}` : currentText;
        const top3 = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens, true);
        this.lexer.state.top = top3;
        if (lines2.length === 0) {
          break;
        }
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "code") {
          break;
        } else if (lastToken?.type === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines2.join("\n");
          const newToken = this.blockquote(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
          break;
        } else if (lastToken?.type === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines2.join("\n");
          const newToken = this.list(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
          lines2 = newText.substring(tokens.at(-1).raw.length).split("\n");
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list2 = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = this.rules.other.listItemRegex(bull);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split("\n", 1)[0].replace(this.rules.other.listReplaceTabs, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split("\n", 1)[0];
        let blankLine = !line.trim();
        let indent3 = 0;
        if (this.options.pedantic) {
          indent3 = 2;
          itemContents = line.trimStart();
        } else if (blankLine) {
          indent3 = cap[1].length + 1;
        } else {
          indent3 = cap[2].search(this.rules.other.nonSpaceChar);
          indent3 = indent3 > 4 ? 1 : indent3;
          itemContents = line.slice(indent3);
          indent3 += cap[1].length;
        }
        if (blankLine && this.rules.other.blankLine.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = this.rules.other.nextBulletRegex(indent3);
          const hrRegex = this.rules.other.hrRegex(indent3);
          const fencesBeginRegex = this.rules.other.fencesBeginRegex(indent3);
          const headingBeginRegex = this.rules.other.headingBeginRegex(indent3);
          const htmlBeginRegex = this.rules.other.htmlBeginRegex(indent3);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(this.rules.other.listReplaceNesting, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(this.rules.other.tabCharGlobal, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(this.rules.other.nonSpaceChar) >= indent3 || !nextLine.trim()) {
              itemContents += "\n" + nextLineWithoutTabs.slice(indent3);
            } else {
              if (blankLine) {
                break;
              }
              if (line.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLineWithoutTabs.slice(indent3);
          }
        }
        if (!list2.loose) {
          if (endsWithBlankLine) {
            list2.loose = true;
          } else if (this.rules.other.doubleBlankLine.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = this.rules.other.listIsTask.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(this.rules.other.listReplaceTask, "");
          }
        }
        list2.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list2.raw += raw;
      }
      const lastItem = list2.items.at(-1);
      if (lastItem) {
        lastItem.raw = lastItem.raw.trimEnd();
        lastItem.text = lastItem.text.trimEnd();
      } else {
        return;
      }
      list2.raw = list2.raw.trimEnd();
      for (let i = 0; i < list2.items.length; i++) {
        this.lexer.state.top = false;
        list2.items[i].tokens = this.lexer.blockTokens(list2.items[i].text, []);
        if (!list2.loose) {
          const spacers = list2.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => this.rules.other.anyLine.test(t.raw));
          list2.loose = hasMultipleLineBreaks;
        }
      }
      if (list2.loose) {
        for (let i = 0; i < list2.items.length; i++) {
          list2.items[i].loose = true;
        }
      }
      return list2;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag2 = cap[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " ");
      const href = cap[2] ? cap[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag: tag2,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!this.rules.other.tableDelimiter.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(this.rules.other.tableAlignChars, "").split("|");
    const rows2 = cap[3]?.trim() ? cap[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (this.rules.other.tableAlignRight.test(align)) {
        item.align.push("right");
      } else if (this.rules.other.tableAlignCenter.test(align)) {
        item.align.push("center");
      } else if (this.rules.other.tableAlignLeft.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i = 0; i < headers.length; i++) {
      item.header.push({
        text: headers[i],
        tokens: this.lexer.inline(headers[i]),
        header: true,
        align: item.align[i]
      });
    }
    for (const row of rows2) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: cap[1]
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && this.rules.other.startATag.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && this.rules.other.endATag.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(trimmedUrl)) {
        if (!this.rules.other.endAngleBracket.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex === -2) {
          return;
        }
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link2 = this.rules.other.pedanticHrefTitle.exec(href);
        if (link2) {
          href = link2[1];
          title = link2[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (this.rules.other.startAngleBracket.test(href)) {
        if (this.options.pedantic && !this.rules.other.endAngleBracket.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title ? title.replace(this.rules.inline.anyPunctuation, "$1") : title
      }, cap[0], this.lexer, this.rules);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(this.rules.other.multipleSpaceGlobal, " ");
      const link2 = links[linkString.toLowerCase()];
      if (!link2) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link2, cap[0], this.lexer, this.rules);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match3 = this.rules.inline.emStrongLDelim.exec(src);
    if (!match3) return;
    if (match3[3] && prevChar.match(this.rules.other.unicodeAlphaNumeric)) return;
    const nextChar = match3[1] || match3[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [
        ...match3[0]
      ].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match3[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match3 = endReg.exec(maskedSrc)) != null) {
        rDelim = match3[1] || match3[2] || match3[3] || match3[4] || match3[5] || match3[6];
        if (!rDelim) continue;
        rLength = [
          ...rDelim
        ].length;
        if (match3[3] || match3[4]) {
          delimTotal += rLength;
          continue;
        } else if (match3[5] || match3[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0) continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [
          ...match3[0]
        ][0].length;
        const raw = src.slice(0, lLength + match3.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(this.rules.other.newLineCharGlobal, " ");
      const hasNonSpaceChars = this.rules.other.nonSpaceChar.test(text);
      const hasSpaceCharsOnBothEnds = this.rules.other.startingSpaceChar.test(text) && this.rules.other.endingSpaceChar.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[1];
        href = "mailto:" + text;
      } else {
        text = cap[1];
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[0];
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? "";
        } while (prevCapZero !== cap[0]);
        text = cap[0];
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      const escaped2 = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        escaped: escaped2
      };
    }
  }
};
var _Lexer = class __Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options22) {
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options22 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules2 = {
      other,
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules2.block = block.pedantic;
      rules2.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules2.block = block.gfm;
      if (this.options.breaks) {
        rules2.inline = inline.breaks;
      } else {
        rules2.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules2;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options22) {
    const lexer2 = new __Lexer(options22);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options22) {
    const lexer2 = new __Lexer(options22);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(other.carriageReturn, "\n");
    this.blockTokens(src, this.tokens);
    for (let i = 0; i < this.inlineQueue.length; i++) {
      const next = this.inlineQueue[i];
      this.inlineTokens(next.src, next.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens = [], lastParagraphClipped = false) {
    if (this.options.pedantic) {
      src = src.replace(other.tabCharGlobal, "    ").replace(other.spaceLine, "");
    }
    while (src) {
      let token;
      if (this.options.extensions?.block?.some((extTokenizer) => {
        if (token = extTokenizer.call({
          lexer: this
        }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.raw.length === 1 && lastToken !== void 0) {
          lastToken.raw += "\n";
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.raw;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({
            lexer: this
          }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        const lastToken = tokens.at(-1);
        if (lastParagraphClipped && lastToken?.type === "paragraph") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({
      src,
      tokens
    });
    return tokens;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    let maskedSrc = src;
    let match3 = null;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match3 = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match3[0].slice(match3[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match3.index) + "[" + "a".repeat(match3[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match3 = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match3.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while ((match3 = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match3.index) + "[" + "a".repeat(match3[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    let keepPrevChar = false;
    let prevChar = "";
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      let token;
      if (this.options.extensions?.inline?.some((extTokenizer) => {
        if (token = extTokenizer.call({
          lexer: this
        }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.type === "text" && lastToken?.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({
            lexer: this
          }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
};
var _Renderer = class {
  options;
  parser;
  // set by the parser
  constructor(options22) {
    this.options = options22 || _defaults;
  }
  space(token) {
    return "";
  }
  code({ text, lang, escaped: escaped2 }) {
    const langString = (lang || "").match(other.notSpaceStart)?.[0];
    const code2 = text.replace(other.endingNewline, "") + "\n";
    if (!langString) {
      return "<pre><code>" + (escaped2 ? code2 : escape22(code2, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape22(langString) + '">' + (escaped2 ? code2 : escape22(code2, true)) + "</code></pre>\n";
  }
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text }) {
    return text;
  }
  heading({ tokens, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>
`;
  }
  hr(token) {
    return "<hr>\n";
  }
  list(token) {
    const ordered = token.ordered;
    const start = token.start;
    let body = "";
    for (let j = 0; j < token.items.length; j++) {
      const item = token.items[j];
      body += this.listitem(item);
    }
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startAttr + ">\n" + body + "</" + type + ">\n";
  }
  listitem(item) {
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({
        checked: !!item.checked
      });
      if (item.loose) {
        if (item.tokens[0]?.type === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + escape22(item.tokens[0].tokens[0].text);
            item.tokens[0].tokens[0].escaped = true;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " ",
            escaped: true
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>
`;
  }
  table(token) {
    let header = "";
    let cell = "";
    for (let j = 0; j < token.header.length; j++) {
      cell += this.tablecell(token.header[j]);
    }
    header += this.tablerow({
      text: cell
    });
    let body = "";
    for (let j = 0; j < token.rows.length; j++) {
      const row = token.rows[j];
      cell = "";
      for (let k = 0; k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }
      body += this.tablerow({
        text: cell
      });
    }
    if (body) body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow({ text }) {
    return `<tr>
${text}</tr>
`;
  }
  tablecell(token) {
    const content = this.parser.parseInline(token.tokens);
    const type = token.header ? "th" : "td";
    const tag2 = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
    return tag2 + content + `</${type}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens }) {
    return `<strong>${this.parser.parseInline(tokens)}</strong>`;
  }
  em({ tokens }) {
    return `<em>${this.parser.parseInline(tokens)}</em>`;
  }
  codespan({ text }) {
    return `<code>${escape22(text, true)}</code>`;
  }
  br(token) {
    return "<br>";
  }
  del({ tokens }) {
    return `<del>${this.parser.parseInline(tokens)}</del>`;
  }
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + escape22(title) + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image({ href, title, text, tokens }) {
    if (tokens) {
      text = this.parser.parseInline(tokens, this.parser.textRenderer);
    }
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return escape22(text);
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${escape22(title)}"`;
    }
    out += ">";
    return out;
  }
  text(token) {
    return "tokens" in token && token.tokens ? this.parser.parseInline(token.tokens) : "escaped" in token && token.escaped ? token.text : escape22(token.text);
  }
};
var _TextRenderer = class {
  // no need for block level renderers
  strong({ text }) {
    return text;
  }
  em({ text }) {
    return text;
  }
  codespan({ text }) {
    return text;
  }
  del({ text }) {
    return text;
  }
  html({ text }) {
    return text;
  }
  text({ text }) {
    return text;
  }
  link({ text }) {
    return "" + text;
  }
  image({ text }) {
    return "" + text;
  }
  br() {
    return "";
  }
};
var _Parser = class __Parser {
  options;
  renderer;
  textRenderer;
  constructor(options22) {
    this.options = options22 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens, options22) {
    const parser2 = new __Parser(options22);
    return parser2.parse(tokens);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options22) {
    const parser2 = new __Parser(options22);
    return parser2.parseInline(tokens);
  }
  /**
   * Parse Loop
   */
  parse(tokens, top3 = true) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({
          parser: this
        }, genericToken);
        if (ret !== false || ![
          "space",
          "hr",
          "heading",
          "code",
          "table",
          "blockquote",
          "list",
          "html",
          "paragraph",
          "text"
        ].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "space": {
          out += this.renderer.space(token);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token);
          continue;
        }
        case "code": {
          out += this.renderer.code(token);
          continue;
        }
        case "table": {
          out += this.renderer.table(token);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token);
          continue;
        }
        case "list": {
          out += this.renderer.list(token);
          continue;
        }
        case "html": {
          out += this.renderer.html(token);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token);
          continue;
        }
        case "text": {
          let textToken = token;
          let body = this.renderer.text(textToken);
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += "\n" + this.renderer.text(textToken);
          }
          if (top3) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [
                {
                  type: "text",
                  raw: body,
                  text: body,
                  escaped: true
                }
              ]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer2 = this.renderer) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({
          parser: this
        }, anyToken);
        if (ret !== false || ![
          "escape",
          "html",
          "link",
          "image",
          "strong",
          "em",
          "codespan",
          "br",
          "del",
          "text"
        ].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "escape": {
          out += renderer2.text(token);
          break;
        }
        case "html": {
          out += renderer2.html(token);
          break;
        }
        case "link": {
          out += renderer2.link(token);
          break;
        }
        case "image": {
          out += renderer2.image(token);
          break;
        }
        case "strong": {
          out += renderer2.strong(token);
          break;
        }
        case "em": {
          out += renderer2.em(token);
          break;
        }
        case "codespan": {
          out += renderer2.codespan(token);
          break;
        }
        case "br": {
          out += renderer2.br(token);
          break;
        }
        case "del": {
          out += renderer2.del(token);
          break;
        }
        case "text": {
          out += renderer2.text(token);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};
var _Hooks = class {
  options;
  block;
  constructor(options22) {
    this.options = options22 || _defaults;
  }
  static passThroughHooks = /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess",
    "processAllTokens"
  ]);
  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html2) {
    return html2;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(tokens) {
    return tokens;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? _Lexer.lex : _Lexer.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? _Parser.parse : _Parser.parseInline;
  }
};
var Marked = class {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = _Parser;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens, callback) {
    let values3 = [];
    for (const token of tokens) {
      values3 = values3.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values3 = values3.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values3 = values3.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values3 = values3.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens2 = genericToken[childTokens].flat(Infinity);
              values3 = values3.concat(this.walkTokens(tokens2, callback));
            });
          } else if (genericToken.tokens) {
            values3 = values3.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values3;
  }
  use(...args) {
    const extensions = this.defaults.extensions || {
      renderers: {},
      childTokens: {}
    };
    args.forEach((pack) => {
      const opts = {
        ...pack
      };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [
                ext.tokenizer
              ];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [
                    ext.start
                  ];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [
                    ext.start
                  ];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer2 = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          if (!(prop in renderer2)) {
            throw new Error(`renderer '${prop}' does not exist`);
          }
          if ([
            "options",
            "parser"
          ].includes(prop)) {
            continue;
          }
          const rendererProp = prop;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer2[rendererProp];
          renderer2[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer2, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer2, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer2;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          if (!(prop in tokenizer)) {
            throw new Error(`tokenizer '${prop}' does not exist`);
          }
          if ([
            "options",
            "rules",
            "lexer"
          ].includes(prop)) {
            continue;
          }
          const tokenizerProp = prop;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop in pack.hooks) {
          if (!(prop in hooks)) {
            throw new Error(`hook '${prop}' does not exist`);
          }
          if ([
            "options",
            "block"
          ].includes(prop)) {
            continue;
          }
          const hooksProp = prop;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values3 = [];
          values3.push(packWalktokens.call(this, token));
          if (walkTokens2) {
            values3 = values3.concat(walkTokens2.call(this, token));
          }
          return values3;
        };
      }
      this.defaults = {
        ...this.defaults,
        ...opts
      };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = {
      ...this.defaults,
      ...opt
    };
    return this;
  }
  lexer(src, options22) {
    return _Lexer.lex(src, options22 ?? this.defaults);
  }
  parser(tokens, options22) {
    return _Parser.parse(tokens, options22 ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse22 = (src, options22) => {
      const origOpt = {
        ...options22
      };
      const opt = {
        ...this.defaults,
        ...origOpt
      };
      const throwError = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer2 = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser2 = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens) => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser2(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens = lexer2(src, opt);
        if (opt.hooks) {
          tokens = opt.hooks.processAllTokens(tokens);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser2(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e2) {
        return throwError(e2);
      }
    };
    return parse22;
  }
  onError(silent, async) {
    return (e2) => {
      e2.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape22(e2.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e2);
      }
      throw e2;
    };
  }
};
var markedInstance = new Marked();
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options22) {
  markedInstance.setOptions(options22);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

// node_modules/.deno/marked-highlight@2.2.2/node_modules/marked-highlight/src/index.js
function markedHighlight(options3) {
  if (typeof options3 === "function") {
    options3 = {
      highlight: options3
    };
  }
  if (!options3 || typeof options3.highlight !== "function") {
    throw new Error("Must provide highlight function");
  }
  if (typeof options3.langPrefix !== "string") {
    options3.langPrefix = "language-";
  }
  if (typeof options3.emptyLangClass !== "string") {
    options3.emptyLangClass = "";
  }
  return {
    async: !!options3.async,
    walkTokens(token) {
      if (token.type !== "code") {
        return;
      }
      const lang = getLang(token.lang);
      if (options3.async) {
        return Promise.resolve(options3.highlight(token.text, lang, token.lang || "")).then(updateToken(token));
      }
      const code2 = options3.highlight(token.text, lang, token.lang || "");
      if (code2 instanceof Promise) {
        throw new Error("markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.");
      }
      updateToken(token)(code2);
    },
    useNewRenderer: true,
    renderer: {
      code(code2, infoString, escaped2) {
        if (typeof code2 === "object") {
          escaped2 = code2.escaped;
          infoString = code2.lang;
          code2 = code2.text;
        }
        const lang = getLang(infoString);
        const classValue = lang ? options3.langPrefix + escape4(lang) : options3.emptyLangClass;
        const classAttr = classValue ? ` class="${classValue}"` : "";
        code2 = code2.replace(/\n$/, "");
        return `<pre><code${classAttr}>${escaped2 ? code2 : escape4(code2, true)}
</code></pre>`;
      }
    }
  };
}
function getLang(lang) {
  return (lang || "").match(/\S*/)[0];
}
function updateToken(token) {
  return (code2) => {
    if (typeof code2 === "string" && code2 !== token.text) {
      token.escaped = true;
      token.text = code2;
    }
  };
}
var escapeTest = /[&<>"']/;
var escapeReplace = new RegExp(escapeTest.source, "g");
var escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
var escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
var escapeReplacements2 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement2 = (ch) => escapeReplacements2[ch];
function escape4(html2, encode) {
  if (encode) {
    if (escapeTest.test(html2)) {
      return html2.replace(escapeReplace, getEscapeReplacement2);
    }
  } else {
    if (escapeTestNoEncode.test(html2)) {
      return html2.replace(escapeReplaceNoEncode, getEscapeReplacement2);
    }
  }
  return html2;
}

// node_modules/.deno/array-back@6.2.2/node_modules/array-back/index.js
function isObject(input) {
  return typeof input === "object" && input !== null;
}
function isArrayLike2(input) {
  return isObject(input) && typeof input.length === "number";
}
function arrayify(input) {
  if (Array.isArray(input)) {
    return input;
  } else if (input === void 0) {
    return [];
  } else if (isArrayLike2(input) || input instanceof Set) {
    return Array.from(input);
  } else {
    return [
      input
    ];
  }
}
var array_back_default = arrayify;

// node_modules/.deno/find-replace@5.0.2/node_modules/find-replace/index.js
function findReplace(array, findFn, ...replaceWiths) {
  const found = [];
  if (!Array.isArray(array)) {
    throw new Error("Input must be an array");
  }
  for (const [index, value] of array.entries()) {
    let expanded = [];
    replaceWiths.forEach((replaceWith) => {
      if (typeof replaceWith === "function") {
        expanded = expanded.concat(replaceWith(value));
      } else {
        expanded.push(replaceWith);
      }
    });
    if (findFn(value)) {
      found.push({
        index,
        replaceWithValue: expanded
      });
    }
  }
  for (const item of found.reverse()) {
    const spliceArgs = [
      item.index,
      1
    ].concat(item.replaceWithValue);
    array.splice.apply(array, spliceArgs);
  }
  return array;
}
var find_replace_default = findReplace;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/argv-tools.js
var re = {
  short: /^-([^\d-])$/,
  long: /^--(\S+)/,
  combinedShort: /^-[^\d-]{2,}$/,
  optEquals: /^(--\S+?)=(.*)/
};
var ArgvArray = class extends Array {
  /**
   * Clears the array has loads the supplied input.
   * @param {string[]} argv - The argv list to load. Defaults to `process.argv`.
   */
  load(argv2) {
    this.clear();
    if (argv2 && argv2 !== process.argv) {
      argv2 = array_back_default(argv2);
    } else {
      argv2 = process.argv.slice(0);
      const deleteCount = process.execArgv.some(isExecArg) ? 1 : 2;
      argv2.splice(0, deleteCount);
    }
    argv2.forEach((arg) => this.push(String(arg)));
  }
  /**
   * Clear the array.
   */
  clear() {
    this.length = 0;
  }
  /**
   * expand ``--option=value` style args.
   */
  expandOptionEqualsNotation() {
    if (this.some((arg) => re.optEquals.test(arg))) {
      const expandedArgs = [];
      this.forEach((arg) => {
        const matches2 = arg.match(re.optEquals);
        if (matches2) {
          expandedArgs.push(matches2[1], matches2[2]);
        } else {
          expandedArgs.push(arg);
        }
      });
      this.clear();
      this.load(expandedArgs);
    }
  }
  /**
   * expand getopt-style combinedShort options.
   */
  expandGetoptNotation() {
    if (this.hasCombinedShortOptions()) {
      find_replace_default(this, re.combinedShort, expandCombinedShortArg);
    }
  }
  /**
   * Returns true if the array contains combined short options (e.g. `-ab`).
   * @returns {boolean}
   */
  hasCombinedShortOptions() {
    return this.some((arg) => re.combinedShort.test(arg));
  }
  static from(argv2) {
    const result = new this();
    result.load(argv2);
    return result;
  }
};
function expandCombinedShortArg(arg) {
  arg = arg.slice(1);
  return arg.split("").map((letter) => "-" + letter);
}
function isOptionEqualsNotation(arg) {
  return re.optEquals.test(arg);
}
function isOption(arg) {
  return (re.short.test(arg) || re.long.test(arg)) && !re.optEquals.test(arg);
}
function isLongOption(arg) {
  return re.long.test(arg) && !isOptionEqualsNotation(arg);
}
function getOptionName(arg) {
  if (re.short.test(arg)) {
    return arg.match(re.short)[1];
  } else if (isLongOption(arg)) {
    return arg.match(re.long)[1];
  } else if (isOptionEqualsNotation(arg)) {
    return arg.match(re.optEquals)[1].replace(/^--/, "");
  } else {
    return null;
  }
}
function isValue(arg) {
  return !(isOption(arg) || re.combinedShort.test(arg) || re.optEquals.test(arg));
}
function isExecArg(arg) {
  return [
    "--eval",
    "-e"
  ].indexOf(arg) > -1 || arg.startsWith("--eval=");
}

// node_modules/.deno/typical@7.3.0/node_modules/typical/index.js
function isNumber(n) {
  return !isNaN(parseFloat(n));
}
function isFiniteNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function isPlainObject2(input) {
  return input !== null && typeof input === "object" && input.constructor === Object;
}
function isArrayLike3(input) {
  return isObject2(input) && typeof input.length === "number";
}
function isObject2(input) {
  return typeof input === "object" && input !== null;
}
function isDefined(input) {
  return typeof input !== "undefined";
}
function isUndefined(input) {
  return !isDefined(input);
}
function isNull(input) {
  return input === null;
}
function isDefinedValue(input) {
  return isDefined(input) && !isNull(input) && !Number.isNaN(input);
}
function isClass(input) {
  if (typeof input === "function") {
    return /^class /.test(Function.prototype.toString.call(input));
  } else {
    return false;
  }
}
function isPrimitive(input) {
  if (input === null) return true;
  switch (typeof input) {
    case "string":
    case "number":
    case "symbol":
    case "undefined":
    case "boolean":
      return true;
    default:
      return false;
  }
}
function isPromise(input) {
  if (input) {
    const isPromise2 = isDefined(Promise) && input instanceof Promise;
    const isThenable = input.then && typeof input.then === "function";
    return !!(isPromise2 || isThenable);
  } else {
    return false;
  }
}
function isIterable(input) {
  if (input === null || !isDefined(input)) {
    return false;
  } else {
    return typeof input[Symbol.iterator] === "function" || typeof input[Symbol.asyncIterator] === "function";
  }
}
function isString(input) {
  return typeof input === "string";
}
function isFunction(input) {
  return typeof input === "function";
}
function isAsyncFunction(input) {
  return typeof input === "function" && input.constructor.name === "AsyncFunction";
}
var typical_default = {
  isNumber,
  isFiniteNumber,
  isPlainObject: isPlainObject2,
  isArrayLike: isArrayLike3,
  isObject: isObject2,
  isDefined,
  isUndefined,
  isNull,
  isDefinedValue,
  isClass,
  isPrimitive,
  isPromise,
  isIterable,
  isString,
  isFunction,
  isAsyncFunction
};

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/option-definition.js
var OptionDefinition = class {
  constructor(definition) {
    this.name = definition.name;
    this.type = definition.type || String;
    this.alias = definition.alias;
    this.multiple = definition.multiple;
    this.lazyMultiple = definition.lazyMultiple;
    this.defaultOption = definition.defaultOption;
    this.defaultValue = definition.defaultValue;
    this.group = definition.group;
    for (const prop in definition) {
      if (!this[prop]) this[prop] = definition[prop];
    }
  }
  isBoolean() {
    return this.type === Boolean || typical_default.isFunction(this.type) && this.type.name === "Boolean";
  }
  isMultiple() {
    return this.multiple || this.lazyMultiple;
  }
  static create(def3) {
    const result = new this(def3);
    return result;
  }
};
var option_definition_default = OptionDefinition;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/option-definitions.js
var Definitions = class extends Array {
  /**
   * validate option definitions
   * @param {boolean} [caseInsensitive=false] - whether arguments will be parsed in a case insensitive manner
   * @returns {string}
   */
  validate(caseInsensitive) {
    const someHaveNoName = this.some((def3) => !def3.name);
    if (someHaveNoName) {
      halt("INVALID_DEFINITIONS", "Invalid option definitions: the `name` property is required on each definition");
    }
    const someDontHaveFunctionType = this.some((def3) => def3.type && typeof def3.type !== "function");
    if (someDontHaveFunctionType) {
      halt("INVALID_DEFINITIONS", "Invalid option definitions: the `type` property must be a setter fuction (default: `Boolean`)");
    }
    let invalidOption;
    const numericAlias = this.some((def3) => {
      invalidOption = def3;
      return typical_default.isDefined(def3.alias) && typical_default.isNumber(def3.alias);
    });
    if (numericAlias) {
      halt("INVALID_DEFINITIONS", "Invalid option definition: to avoid ambiguity an alias cannot be numeric [--" + invalidOption.name + " alias is -" + invalidOption.alias + "]");
    }
    const multiCharacterAlias = this.some((def3) => {
      invalidOption = def3;
      return typical_default.isDefined(def3.alias) && def3.alias.length !== 1;
    });
    if (multiCharacterAlias) {
      halt("INVALID_DEFINITIONS", "Invalid option definition: an alias must be a single character");
    }
    const hypenAlias = this.some((def3) => {
      invalidOption = def3;
      return def3.alias === "-";
    });
    if (hypenAlias) {
      halt("INVALID_DEFINITIONS", 'Invalid option definition: an alias cannot be "-"');
    }
    const duplicateName = hasDuplicates(this.map((def3) => caseInsensitive ? def3.name.toLowerCase() : def3.name));
    if (duplicateName) {
      halt("INVALID_DEFINITIONS", "Two or more option definitions have the same name");
    }
    const duplicateAlias = hasDuplicates(this.map((def3) => caseInsensitive && typical_default.isDefined(def3.alias) ? def3.alias.toLowerCase() : def3.alias));
    if (duplicateAlias) {
      halt("INVALID_DEFINITIONS", "Two or more option definitions have the same alias");
    }
    const duplicateDefaultOption = this.filter((def3) => def3.defaultOption === true).length > 1;
    if (duplicateDefaultOption) {
      halt("INVALID_DEFINITIONS", "Only one option definition can be the defaultOption");
    }
    const defaultBoolean = this.some((def3) => {
      invalidOption = def3;
      return def3.isBoolean() && def3.defaultOption;
    });
    if (defaultBoolean) {
      halt("INVALID_DEFINITIONS", `A boolean option ["${invalidOption.name}"] can not also be the defaultOption.`);
    }
  }
  /**
   * Get definition by option arg (e.g. `--one` or `-o`)
   * @param {string} [arg] the argument name to get the definition for
   * @param {boolean} [caseInsensitive] whether to use case insensitive comparisons when finding the appropriate definition
   * @returns {Definition}
   */
  get(arg, caseInsensitive) {
    if (isOption(arg)) {
      if (re.short.test(arg)) {
        const shortOptionName = getOptionName(arg);
        if (caseInsensitive) {
          const lowercaseShortOptionName = shortOptionName.toLowerCase();
          return this.find((def3) => typical_default.isDefined(def3.alias) && def3.alias.toLowerCase() === lowercaseShortOptionName);
        } else {
          return this.find((def3) => def3.alias === shortOptionName);
        }
      } else {
        const optionName = getOptionName(arg);
        if (caseInsensitive) {
          const lowercaseOptionName = optionName.toLowerCase();
          return this.find((def3) => def3.name.toLowerCase() === lowercaseOptionName);
        } else {
          return this.find((def3) => def3.name === optionName);
        }
      }
    } else {
      return this.find((def3) => def3.name === arg);
    }
  }
  getDefault() {
    return this.find((def3) => def3.defaultOption === true);
  }
  isGrouped() {
    return this.some((def3) => def3.group);
  }
  whereGrouped() {
    return this.filter(containsValidGroup);
  }
  whereNotGrouped() {
    return this.filter((def3) => !containsValidGroup(def3));
  }
  whereDefaultValueSet() {
    return this.filter((def3) => typical_default.isDefined(def3.defaultValue));
  }
  static from(definitions, caseInsensitive) {
    if (definitions instanceof this) return definitions;
    const result = super.from(array_back_default(definitions), (def3) => option_definition_default.create(def3));
    result.validate(caseInsensitive);
    return result;
  }
};
function halt(name, message) {
  const err = new Error(message);
  err.name = name;
  throw err;
}
function containsValidGroup(def3) {
  return array_back_default(def3.group).some((group3) => group3);
}
function hasDuplicates(array) {
  const items = {};
  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (items[value]) {
      return true;
    } else {
      if (typical_default.isDefined(value)) items[value] = true;
    }
  }
}
var option_definitions_default = Definitions;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/argv-parser.js
var ArgvParser = class {
  /**
   * @param {OptionDefinitions} - Definitions array
   * @param {object} [options] - Options
   * @param {string[]} [options.argv] - Overrides `process.argv`
   * @param {boolean} [options.stopAtFirstUnknown] -
   * @param {boolean} [options.caseInsensitive] - Arguments will be parsed in a case insensitive manner. Defaults to false.
   */
  constructor(definitions, options3) {
    this.options = Object.assign({}, options3);
    this.definitions = option_definitions_default.from(definitions, this.options.caseInsensitive);
    this.argv = ArgvArray.from(this.options.argv);
    if (this.argv.hasCombinedShortOptions()) {
      find_replace_default(this.argv, re.combinedShort.test.bind(re.combinedShort), (arg) => {
        arg = arg.slice(1);
        return arg.split("").map((letter) => ({
          origArg: `-${arg}`,
          arg: "-" + letter
        }));
      });
    }
  }
  /**
   * Yields one `{ event, name, value, arg, def }` argInfo object for each arg in `process.argv` (or `options.argv`).
   */
  *[Symbol.iterator]() {
    const definitions = this.definitions;
    let def3;
    let value;
    let name;
    let event;
    let singularDefaultSet = false;
    let unknownFound = false;
    let origArg;
    for (let arg of this.argv) {
      if (typical_default.isPlainObject(arg)) {
        origArg = arg.origArg;
        arg = arg.arg;
      }
      if (unknownFound && this.options.stopAtFirstUnknown) {
        yield {
          event: "unknown_value",
          arg,
          name: "_unknown",
          value: void 0
        };
        continue;
      }
      if (isOption(arg)) {
        def3 = definitions.get(arg, this.options.caseInsensitive);
        value = void 0;
        if (def3) {
          value = def3.isBoolean() ? true : null;
          event = "set";
        } else {
          event = "unknown_option";
        }
      } else if (isOptionEqualsNotation(arg)) {
        const matches2 = arg.match(re.optEquals);
        def3 = definitions.get(matches2[1], this.options.caseInsensitive);
        if (def3) {
          if (def3.isBoolean()) {
            yield {
              event: "unknown_value",
              arg,
              name: "_unknown",
              value,
              def: def3
            };
            event = "set";
            value = true;
          } else {
            event = "set";
            value = matches2[2];
          }
        } else {
          event = "unknown_option";
        }
      } else if (isValue(arg)) {
        if (def3) {
          value = arg;
          event = "set";
        } else {
          def3 = this.definitions.getDefault();
          if (def3 && !singularDefaultSet) {
            value = arg;
            event = "set";
          } else {
            event = "unknown_value";
            def3 = void 0;
          }
        }
      }
      name = def3 ? def3.name : "_unknown";
      const argInfo = {
        event,
        arg,
        name,
        value,
        def: def3
      };
      if (origArg) {
        argInfo.subArg = arg;
        argInfo.arg = origArg;
      }
      yield argInfo;
      if (name === "_unknown") unknownFound = true;
      if (def3 && def3.defaultOption && !def3.isMultiple() && event === "set") singularDefaultSet = true;
      if (def3 && def3.isBoolean()) def3 = void 0;
      if (def3 && !def3.multiple && typical_default.isDefined(value) && value !== null) {
        def3 = void 0;
      }
      value = void 0;
      event = void 0;
      name = void 0;
      origArg = void 0;
    }
  }
};
var argv_parser_default = ArgvParser;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/option.js
var _value = /* @__PURE__ */ new WeakMap();
var Option = class {
  constructor(definition) {
    this.definition = new option_definition_default(definition);
    this.state = null;
    this.resetToDefault();
  }
  get() {
    return _value.get(this);
  }
  set(val) {
    this._set(val, "set");
  }
  _set(val, state) {
    const def3 = this.definition;
    if (def3.isMultiple()) {
      if (val !== null && val !== void 0) {
        const arr = this.get();
        if (this.state === "default") arr.length = 0;
        arr.push(def3.type(val));
        this.state = state;
      }
    } else {
      if (!def3.isMultiple() && this.state === "set") {
        const err = new Error(`Singular option already set [${this.definition.name}=${this.get()}]`);
        err.name = "ALREADY_SET";
        err.value = val;
        err.optionName = def3.name;
        throw err;
      } else if (val === null || val === void 0) {
        _value.set(this, val);
      } else {
        _value.set(this, def3.type(val));
        this.state = state;
      }
    }
  }
  resetToDefault() {
    if (typical_default.isDefined(this.definition.defaultValue)) {
      if (this.definition.isMultiple()) {
        _value.set(this, array_back_default(this.definition.defaultValue).slice());
      } else {
        _value.set(this, this.definition.defaultValue);
      }
    } else {
      if (this.definition.isMultiple()) {
        _value.set(this, []);
      } else {
        _value.set(this, null);
      }
    }
    this.state = "default";
  }
  static create(definition) {
    definition = new option_definition_default(definition);
    if (definition.isBoolean()) {
      return FlagOption.create(definition);
    } else {
      return new this(definition);
    }
  }
};
var FlagOption = class extends Option {
  set(val) {
    super.set(true);
  }
  static create(def3) {
    return new this(def3);
  }
};
var option_default = Option;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/output.js
var import_lodash = __toESM(require_lodash());
var Output = class extends Map {
  constructor(definitions) {
    super();
    this.definitions = option_definitions_default.from(definitions);
    this.set("_unknown", option_default.create({
      name: "_unknown",
      multiple: true
    }));
    for (const def3 of this.definitions.whereDefaultValueSet()) {
      this.set(def3.name, option_default.create(def3));
    }
  }
  toObject(options3) {
    options3 = options3 || {};
    const output = {};
    for (const item of this) {
      const name = options3.camelCase && item[0] !== "_unknown" ? (0, import_lodash.default)(item[0]) : item[0];
      const option = item[1];
      if (name === "_unknown" && !option.get().length) continue;
      output[name] = option.get();
    }
    if (options3.skipUnknown) delete output._unknown;
    return output;
  }
};
var output_default = Output;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/lib/output-grouped.js
var import_lodash2 = __toESM(require_lodash());
var GroupedOutput = class extends output_default {
  toObject(options3) {
    const superOutputNoCamel = super.toObject({
      skipUnknown: options3.skipUnknown
    });
    const superOutput = super.toObject(options3);
    const unknown = superOutput._unknown;
    delete superOutput._unknown;
    const grouped = {
      _all: superOutput
    };
    if (unknown && unknown.length) grouped._unknown = unknown;
    this.definitions.whereGrouped().forEach((def3) => {
      const name = options3.camelCase ? (0, import_lodash2.default)(def3.name) : def3.name;
      const outputValue = superOutputNoCamel[def3.name];
      for (const groupName of array_back_default(def3.group)) {
        grouped[groupName] = grouped[groupName] || {};
        if (typical_default.isDefined(outputValue)) {
          grouped[groupName][name] = outputValue;
        }
      }
    });
    this.definitions.whereNotGrouped().forEach((def3) => {
      const name = options3.camelCase ? (0, import_lodash2.default)(def3.name) : def3.name;
      const outputValue = superOutputNoCamel[def3.name];
      if (typical_default.isDefined(outputValue)) {
        if (!grouped._none) grouped._none = {};
        grouped._none[name] = outputValue;
      }
    });
    return grouped;
  }
};
var output_grouped_default = GroupedOutput;

// node_modules/.deno/command-line-args@6.0.1/node_modules/command-line-args/index.js
function commandLineArgs(optionDefinitions, options3) {
  options3 = options3 || {};
  if (options3.stopAtFirstUnknown) options3.partial = true;
  optionDefinitions = option_definitions_default.from(optionDefinitions, options3.caseInsensitive);
  const parser2 = new argv_parser_default(optionDefinitions, {
    argv: options3.argv,
    stopAtFirstUnknown: options3.stopAtFirstUnknown,
    caseInsensitive: options3.caseInsensitive
  });
  const OutputClass = optionDefinitions.isGrouped() ? output_grouped_default : output_default;
  const output = new OutputClass(optionDefinitions);
  for (const argInfo of parser2) {
    const arg = argInfo.subArg || argInfo.arg;
    if (!options3.partial) {
      if (argInfo.event === "unknown_value") {
        const err = new Error(`Unknown value: ${arg}`);
        err.name = "UNKNOWN_VALUE";
        err.value = arg;
        throw err;
      } else if (argInfo.event === "unknown_option") {
        const err = new Error(`Unknown option: ${arg}`);
        err.name = "UNKNOWN_OPTION";
        err.optionName = arg;
        throw err;
      }
    }
    let option;
    if (output.has(argInfo.name)) {
      option = output.get(argInfo.name);
    } else {
      option = option_default.create(argInfo.def);
      output.set(argInfo.name, option);
    }
    if (argInfo.name === "_unknown") {
      option.set(arg);
    } else {
      option.set(argInfo.value);
    }
  }
  return output.toObject({
    skipUnknown: !options3.partial,
    camelCase: options3.camelCase
  });
}
var command_line_args_default = commandLineArgs;

// site/build-scripts/render-markdown.js
function logErr(err, config) {
  if (!config["panics"]) {
    console.error(String(err), err);
  }
}
function isConsole(node) {
  switch (node.type) {
    case "call":
    case "pipe":
    case "map":
      break;
    default:
      return false;
  }
  const { func } = node.value;
  if (func.type === "access") {
    const { lhs } = func.value;
    return lhs.type === "name" && lhs.value === "Console";
  }
  return func.type === "name" && func.value === "print";
}
async function renderCode(code2, config, filePath, env2) {
  let tokens;
  try {
    tokens = tokenize(`${filePath}:embedded`, code2);
  } catch (err) {
    logErr(err, config);
    tokens = [];
    panic = h`<pre class="result panic"><code>${err}</code></pre>`;
  }
  const source = !config["hide"] && h`<pre><code class="ptls">$${highlight(tokens)}</code></pre>`;
  let resultLines = "";
  let finalDef = "";
  let panic = "";
  shimConsole.inputs = config.input ?? [];
  if (!config["no-eval"]) {
    const display = config["raw"] ? (value) => show(value, config["compact"]) : (value) => repr(value, config["compact"]);
    const echo = !config["no-echo"];
    const maxHeight = config["max-height"] && `max-height: ${config["max-height"]}px;`;
    const wrap2 = config["wrap"] ? "wrap" : "";
    const attrs = h`class="result ${wrap2}" style="${maxHeight}"`;
    const results = [];
    let statements;
    try {
      statements = parse2(tokens);
    } catch (err) {
      logErr(err, config);
      statements = [];
      panic = h`<pre class="result panic"><code>${err}</code></pre>`;
    }
    for (const statement of statements) {
      try {
        const result = await env2.eval(statement);
        finalDef = "";
        if (shimConsole.output.length) {
          results.push(shimConsole.getOutput());
        }
        switch (statement.type) {
          case "for":
          case "tandemFor":
          case "anonFor":
          case "while":
            break;
          case "def":
            if (echo && statement.value.rhs.type !== "fn") {
              const name = statement.value.name;
              const value = env2.lookup(name);
              finalDef = h`
                <pre $${attrs}><code><div class="var-name">${name}</div>${display(value)}</code></pre>
              `;
            }
            break;
          default:
            if (echo && !isConsole(statement)) {
              results.push(display(result) + "\n");
            }
        }
      } catch (err) {
        logErr(err, config);
        panic = h`<pre class="result panic"><code>${err}</code></pre>`;
        finalDef = "";
        break;
      }
    }
    if (results.length) {
      resultLines = h`<pre $${attrs}><code>${results.join("")}</code></pre>`;
    }
  }
  return h`
    <div class="snippet ${config.class}">
      $${source}
      $${resultLines}
      $${finalDef}
      $${panic}
    </div>`;
}
var options2 = [
  {
    name: "class",
    type: String
  },
  {
    name: "compact",
    type: Boolean
  },
  {
    name: "hide",
    type: Boolean
  },
  {
    name: "input",
    type: String,
    multiple: true
  },
  {
    name: "max-height",
    type: Number
  },
  {
    name: "no-echo",
    type: Boolean
  },
  {
    name: "no-eval",
    type: Boolean
  },
  {
    name: "panics",
    type: Boolean
  },
  {
    name: "raw",
    type: Boolean
  },
  {
    name: "wrap",
    type: Boolean
  }
];
function headerId(title) {
  return title.toLowerCase().replace(/[^\w\s-]+/g, "").trim().replace(/\s+/g, "-");
}
var renderer = {
  heading({ text, depth, raw }) {
    const anchor = headerId(raw);
    const hr2 = depth === 2 ? "<hr />" : "";
    return h`
      $${hr2}
      
      <h${depth} id="${anchor}">
        <a href="#${anchor}">${text}</a>
      </h${depth}>
    `;
  },
  code({ text }) {
    if (!text.trim().startsWith('<div class="snippet')) {
      return h`<pre><code>${text}</code></pre>`;
    }
    return text;
  }
};
async function renderMarkdown(filePath, source) {
  let queue = Promise.resolve();
  function serialize2(func) {
    queue = queue.then(func);
    return queue;
  }
  const env2 = await spawnDocStd();
  const marked2 = new Marked();
  const highlighter = markedHighlight({
    langPrefix: "",
    async: true,
    async highlight(code2, lang, info) {
      const config = command_line_args_default(options2, {
        argv: info.split(" ").slice(1)
      });
      if (lang === "ptls") {
        return await serialize2(() => renderCode(code2, config, filePath, env2));
      }
      return code2;
    }
  });
  marked2.use(highlighter, {
    renderer
  });
  return await marked2.parse(source);
}

// notebook/serve.js
import { watch } from "node:fs";
import { readFile as readFile4 } from "node:fs/promises";
import http from "node:http";

// node_modules/.deno/ws@8.18.3/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// node_modules/.deno/open@10.2.0/node_modules/open/index.js
import process7 from "node:process";
import { Buffer as Buffer3 } from "node:buffer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify as promisify5 } from "node:util";
import childProcess from "node:child_process";
import fs5, { constants as fsConstants2 } from "node:fs/promises";

// node_modules/.deno/wsl-utils@0.1.0/node_modules/wsl-utils/index.js
import process3 from "node:process";
import fs4, { constants as fsConstants } from "node:fs/promises";

// node_modules/.deno/is-wsl@3.1.0/node_modules/is-wsl/index.js
import process2 from "node:process";
import os from "node:os";
import fs3 from "node:fs";

// node_modules/.deno/is-inside-container@1.0.0/node_modules/is-inside-container/index.js
import fs2 from "node:fs";

// node_modules/.deno/is-docker@3.0.0/node_modules/is-docker/index.js
import fs from "node:fs";
var isDockerCached;
function hasDockerEnv() {
  try {
    fs.statSync("/.dockerenv");
    return true;
  } catch {
    return false;
  }
}
function hasDockerCGroup() {
  try {
    return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
  } catch {
    return false;
  }
}
function isDocker() {
  if (isDockerCached === void 0) {
    isDockerCached = hasDockerEnv() || hasDockerCGroup();
  }
  return isDockerCached;
}

// node_modules/.deno/is-inside-container@1.0.0/node_modules/is-inside-container/index.js
var cachedResult;
var hasContainerEnv = () => {
  try {
    fs2.statSync("/run/.containerenv");
    return true;
  } catch {
    return false;
  }
};
function isInsideContainer() {
  if (cachedResult === void 0) {
    cachedResult = hasContainerEnv() || isDocker();
  }
  return cachedResult;
}

// node_modules/.deno/is-wsl@3.1.0/node_modules/is-wsl/index.js
var isWsl = () => {
  if (process2.platform !== "linux") {
    return false;
  }
  if (os.release().toLowerCase().includes("microsoft")) {
    if (isInsideContainer()) {
      return false;
    }
    return true;
  }
  try {
    return fs3.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft") ? !isInsideContainer() : false;
  } catch {
    return false;
  }
};
var is_wsl_default = process2.env.__IS_WSL_TEST__ ? isWsl : isWsl();

// node_modules/.deno/wsl-utils@0.1.0/node_modules/wsl-utils/index.js
var wslDrivesMountPoint = /* @__PURE__ */ (() => {
  const defaultMountPoint = "/mnt/";
  let mountPoint;
  return async function() {
    if (mountPoint) {
      return mountPoint;
    }
    const configFilePath = "/etc/wsl.conf";
    let isConfigFileExists = false;
    try {
      await fs4.access(configFilePath, fsConstants.F_OK);
      isConfigFileExists = true;
    } catch {
    }
    if (!isConfigFileExists) {
      return defaultMountPoint;
    }
    const configContent = await fs4.readFile(configFilePath, {
      encoding: "utf8"
    });
    const configMountPoint = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(configContent);
    if (!configMountPoint) {
      return defaultMountPoint;
    }
    mountPoint = configMountPoint.groups.mountPoint.trim();
    mountPoint = mountPoint.endsWith("/") ? mountPoint : `${mountPoint}/`;
    return mountPoint;
  };
})();
var powerShellPathFromWsl = async () => {
  const mountPoint = await wslDrivesMountPoint();
  return `${mountPoint}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`;
};
var powerShellPath = async () => {
  if (is_wsl_default) {
    return powerShellPathFromWsl();
  }
  return `${process3.env.SYSTEMROOT || process3.env.windir || String.raw`C:\Windows`}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;
};

// node_modules/.deno/define-lazy-prop@3.0.0/node_modules/define-lazy-prop/index.js
function defineLazyProperty(object, propertyName, valueGetter) {
  const define = (value) => Object.defineProperty(object, propertyName, {
    value,
    enumerable: true,
    writable: true
  });
  Object.defineProperty(object, propertyName, {
    configurable: true,
    enumerable: true,
    get() {
      const result = valueGetter();
      define(result);
      return result;
    },
    set(value) {
      define(value);
    }
  });
  return object;
}

// node_modules/.deno/default-browser@5.2.1/node_modules/default-browser/index.js
import { promisify as promisify4 } from "node:util";
import process6 from "node:process";
import { execFile as execFile4 } from "node:child_process";

// node_modules/.deno/default-browser-id@5.0.0/node_modules/default-browser-id/index.js
import { promisify } from "node:util";
import process4 from "node:process";
import { execFile } from "node:child_process";
var execFileAsync = promisify(execFile);
async function defaultBrowserId() {
  if (process4.platform !== "darwin") {
    throw new Error("macOS only");
  }
  const { stdout: stdout3 } = await execFileAsync("defaults", [
    "read",
    "com.apple.LaunchServices/com.apple.launchservices.secure",
    "LSHandlers"
  ]);
  const match3 = /LSHandlerRoleAll = "(?!-)(?<id>[^"]+?)";\s+?LSHandlerURLScheme = (?:http|https);/.exec(stdout3);
  return match3?.groups.id ?? "com.apple.Safari";
}

// node_modules/.deno/run-applescript@7.1.0/node_modules/run-applescript/index.js
import process5 from "node:process";
import { promisify as promisify2 } from "node:util";
import { execFile as execFile2, execFileSync } from "node:child_process";
var execFileAsync2 = promisify2(execFile2);
async function runAppleScript(script, { humanReadableOutput = true, signal } = {}) {
  if (process5.platform !== "darwin") {
    throw new Error("macOS only");
  }
  const outputArguments = humanReadableOutput ? [] : [
    "-ss"
  ];
  const execOptions = {};
  if (signal) {
    execOptions.signal = signal;
  }
  const { stdout: stdout3 } = await execFileAsync2("osascript", [
    "-e",
    script,
    outputArguments
  ], execOptions);
  return stdout3.trim();
}

// node_modules/.deno/bundle-name@4.1.0/node_modules/bundle-name/index.js
async function bundleName(bundleId) {
  return runAppleScript(`tell application "Finder" to set app_path to application file id "${bundleId}" as string
tell application "System Events" to get value of property list item "CFBundleName" of property list file (app_path & ":Contents:Info.plist")`);
}

// node_modules/.deno/default-browser@5.2.1/node_modules/default-browser/windows.js
import { promisify as promisify3 } from "node:util";
import { execFile as execFile3 } from "node:child_process";
var execFileAsync3 = promisify3(execFile3);
var windowsBrowserProgIds = {
  AppXq0fevzme2pys62n3e0fbqa7peapykr8v: {
    name: "Edge",
    id: "com.microsoft.edge.old"
  },
  MSEdgeDHTML: {
    name: "Edge",
    id: "com.microsoft.edge"
  },
  MSEdgeHTM: {
    name: "Edge",
    id: "com.microsoft.edge"
  },
  "IE.HTTP": {
    name: "Internet Explorer",
    id: "com.microsoft.ie"
  },
  FirefoxURL: {
    name: "Firefox",
    id: "org.mozilla.firefox"
  },
  ChromeHTML: {
    name: "Chrome",
    id: "com.google.chrome"
  },
  BraveHTML: {
    name: "Brave",
    id: "com.brave.Browser"
  },
  BraveBHTML: {
    name: "Brave Beta",
    id: "com.brave.Browser.beta"
  },
  BraveSSHTM: {
    name: "Brave Nightly",
    id: "com.brave.Browser.nightly"
  }
};
var UnknownBrowserError = class extends Error {
};
async function defaultBrowser(_execFileAsync = execFileAsync3) {
  const { stdout: stdout3 } = await _execFileAsync("reg", [
    "QUERY",
    " HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice",
    "/v",
    "ProgId"
  ]);
  const match3 = /ProgId\s*REG_SZ\s*(?<id>\S+)/.exec(stdout3);
  if (!match3) {
    throw new UnknownBrowserError(`Cannot find Windows browser in stdout: ${JSON.stringify(stdout3)}`);
  }
  const { id } = match3.groups;
  const browser = windowsBrowserProgIds[id];
  if (!browser) {
    throw new UnknownBrowserError(`Unknown browser ID: ${id}`);
  }
  return browser;
}

// node_modules/.deno/default-browser@5.2.1/node_modules/default-browser/index.js
var execFileAsync4 = promisify4(execFile4);
var titleize = (string) => string.toLowerCase().replaceAll(/(?:^|\s|-)\S/g, (x) => x.toUpperCase());
async function defaultBrowser2() {
  if (process6.platform === "darwin") {
    const id = await defaultBrowserId();
    const name = await bundleName(id);
    return {
      name,
      id
    };
  }
  if (process6.platform === "linux") {
    const { stdout: stdout3 } = await execFileAsync4("xdg-mime", [
      "query",
      "default",
      "x-scheme-handler/http"
    ]);
    const id = stdout3.trim();
    const name = titleize(id.replace(/.desktop$/, "").replace("-", " "));
    return {
      name,
      id
    };
  }
  if (process6.platform === "win32") {
    return defaultBrowser();
  }
  throw new Error("Only macOS, Linux, and Windows are supported");
}

// node_modules/.deno/open@10.2.0/node_modules/open/index.js
var execFile5 = promisify5(childProcess.execFile);
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var localXdgOpenPath = path.join(__dirname, "xdg-open");
var { platform, arch } = process7;
async function getWindowsDefaultBrowserFromWsl() {
  const powershellPath = await powerShellPath();
  const rawCommand = String.raw`(Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice").ProgId`;
  const encodedCommand = Buffer3.from(rawCommand, "utf16le").toString("base64");
  const { stdout: stdout3 } = await execFile5(powershellPath, [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-EncodedCommand",
    encodedCommand
  ], {
    encoding: "utf8"
  });
  const progId = stdout3.trim();
  const browserMap = {
    ChromeHTML: "com.google.chrome",
    BraveHTML: "com.brave.Browser",
    MSEdgeHTM: "com.microsoft.edge",
    FirefoxURL: "org.mozilla.firefox"
  };
  return browserMap[progId] ? {
    id: browserMap[progId]
  } : {};
}
var pTryEach = async (array, mapper) => {
  let latestError;
  for (const item of array) {
    try {
      return await mapper(item);
    } catch (error2) {
      latestError = error2;
    }
  }
  throw latestError;
};
var baseOpen = async (options3) => {
  options3 = {
    wait: false,
    background: false,
    newInstance: false,
    allowNonzeroExitCode: false,
    ...options3
  };
  if (Array.isArray(options3.app)) {
    return pTryEach(options3.app, (singleApp) => baseOpen({
      ...options3,
      app: singleApp
    }));
  }
  let { name: app, arguments: appArguments = [] } = options3.app ?? {};
  appArguments = [
    ...appArguments
  ];
  if (Array.isArray(app)) {
    return pTryEach(app, (appName) => baseOpen({
      ...options3,
      app: {
        name: appName,
        arguments: appArguments
      }
    }));
  }
  if (app === "browser" || app === "browserPrivate") {
    const ids = {
      "com.google.chrome": "chrome",
      "google-chrome.desktop": "chrome",
      "com.brave.Browser": "brave",
      "org.mozilla.firefox": "firefox",
      "firefox.desktop": "firefox",
      "com.microsoft.msedge": "edge",
      "com.microsoft.edge": "edge",
      "com.microsoft.edgemac": "edge",
      "microsoft-edge.desktop": "edge"
    };
    const flags = {
      chrome: "--incognito",
      brave: "--incognito",
      firefox: "--private-window",
      edge: "--inPrivate"
    };
    const browser = is_wsl_default ? await getWindowsDefaultBrowserFromWsl() : await defaultBrowser2();
    if (browser.id in ids) {
      const browserName = ids[browser.id];
      if (app === "browserPrivate") {
        appArguments.push(flags[browserName]);
      }
      return baseOpen({
        ...options3,
        app: {
          name: apps[browserName],
          arguments: appArguments
        }
      });
    }
    throw new Error(`${browser.name} is not supported as a default browser`);
  }
  let command;
  const cliArguments = [];
  const childProcessOptions = {};
  if (platform === "darwin") {
    command = "open";
    if (options3.wait) {
      cliArguments.push("--wait-apps");
    }
    if (options3.background) {
      cliArguments.push("--background");
    }
    if (options3.newInstance) {
      cliArguments.push("--new");
    }
    if (app) {
      cliArguments.push("-a", app);
    }
  } else if (platform === "win32" || is_wsl_default && !isInsideContainer() && !app) {
    command = await powerShellPath();
    cliArguments.push("-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand");
    if (!is_wsl_default) {
      childProcessOptions.windowsVerbatimArguments = true;
    }
    const encodedArguments = [
      "Start"
    ];
    if (options3.wait) {
      encodedArguments.push("-Wait");
    }
    if (app) {
      encodedArguments.push(`"\`"${app}\`""`);
      if (options3.target) {
        appArguments.push(options3.target);
      }
    } else if (options3.target) {
      encodedArguments.push(`"${options3.target}"`);
    }
    if (appArguments.length > 0) {
      appArguments = appArguments.map((argument) => `"\`"${argument}\`""`);
      encodedArguments.push("-ArgumentList", appArguments.join(","));
    }
    options3.target = Buffer3.from(encodedArguments.join(" "), "utf16le").toString("base64");
  } else {
    if (app) {
      command = app;
    } else {
      const isBundled = !__dirname || __dirname === "/";
      let exeLocalXdgOpen = false;
      try {
        await fs5.access(localXdgOpenPath, fsConstants2.X_OK);
        exeLocalXdgOpen = true;
      } catch {
      }
      const useSystemXdgOpen = process7.versions.electron ?? (platform === "android" || isBundled || !exeLocalXdgOpen);
      command = useSystemXdgOpen ? "xdg-open" : localXdgOpenPath;
    }
    if (appArguments.length > 0) {
      cliArguments.push(...appArguments);
    }
    if (!options3.wait) {
      childProcessOptions.stdio = "ignore";
      childProcessOptions.detached = true;
    }
  }
  if (platform === "darwin" && appArguments.length > 0) {
    cliArguments.push("--args", ...appArguments);
  }
  if (options3.target) {
    cliArguments.push(options3.target);
  }
  const subprocess = childProcess.spawn(command, cliArguments, childProcessOptions);
  if (options3.wait) {
    return new Promise((resolve3, reject) => {
      subprocess.once("error", reject);
      subprocess.once("close", (exitCode) => {
        if (!options3.allowNonzeroExitCode && exitCode > 0) {
          reject(new Error(`Exited with code ${exitCode}`));
          return;
        }
        resolve3(subprocess);
      });
    });
  }
  subprocess.unref();
  return subprocess;
};
var open = (target, options3) => {
  if (typeof target !== "string") {
    throw new TypeError("Expected a `target`");
  }
  return baseOpen({
    ...options3,
    target
  });
};
function detectArchBinary(binary) {
  if (typeof binary === "string" || Array.isArray(binary)) {
    return binary;
  }
  const { [arch]: archBinary } = binary;
  if (!archBinary) {
    throw new Error(`${arch} is not supported`);
  }
  return archBinary;
}
function detectPlatformBinary({ [platform]: platformBinary }, { wsl }) {
  if (wsl && is_wsl_default) {
    return detectArchBinary(wsl);
  }
  if (!platformBinary) {
    throw new Error(`${platform} is not supported`);
  }
  return detectArchBinary(platformBinary);
}
var apps = {};
defineLazyProperty(apps, "chrome", () => detectPlatformBinary({
  darwin: "google chrome",
  win32: "chrome",
  linux: [
    "google-chrome",
    "google-chrome-stable",
    "chromium"
  ]
}, {
  wsl: {
    ia32: "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    x64: [
      "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
      "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
    ]
  }
}));
defineLazyProperty(apps, "brave", () => detectPlatformBinary({
  darwin: "brave browser",
  win32: "brave",
  linux: [
    "brave-browser",
    "brave"
  ]
}, {
  wsl: {
    ia32: "/mnt/c/Program Files (x86)/BraveSoftware/Brave-Browser/Application/brave.exe",
    x64: [
      "/mnt/c/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
      "/mnt/c/Program Files (x86)/BraveSoftware/Brave-Browser/Application/brave.exe"
    ]
  }
}));
defineLazyProperty(apps, "firefox", () => detectPlatformBinary({
  darwin: "firefox",
  win32: String.raw`C:\Program Files\Mozilla Firefox\firefox.exe`,
  linux: "firefox"
}, {
  wsl: "/mnt/c/Program Files/Mozilla Firefox/firefox.exe"
}));
defineLazyProperty(apps, "edge", () => detectPlatformBinary({
  darwin: "microsoft edge",
  win32: "msedge",
  linux: [
    "microsoft-edge",
    "microsoft-edge-dev"
  ]
}, {
  wsl: "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
}));
defineLazyProperty(apps, "browser", () => "browser");
defineLazyProperty(apps, "browserPrivate", () => "browserPrivate");
var open_default = open;

// notebook/serve.js
async function makePage(filePath) {
  const source = "----\n" + await readFile4(filePath, "utf-8");
  const blocks = source.split(/^-{4,}/gm);
  const embeds = [];
  for (const block2 of blocks) {
    const lines2 = block2.split("\n");
    const args = lines2[0].trim();
    const code2 = lines2.slice(1).join("\n").trim();
    if (code2) {
      embeds.push(`\`\`\`ptls ${args}
${code2}
\`\`\``);
    }
  }
  const inner = await renderMarkdown(filePath, embeds.join("\n\n"));
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="style.css">
        <title>Ptls notebook: ${filePath}</title>
      </head>

      <body>
        <article>
          ${inner}
        </article>

        <script>
          const ws = new WebSocket("ws://" + location.host);

          ws.onmessage = (msg) => {
            document.documentElement.innerHTML = msg.data;
          };
        <\/script>
      </body>
    </html>
  `;
}
async function respond(req, res, filePath) {
  if (req.url === "/style.css") {
    const css = await readFile4(import.meta.dirname + "/style.css");
    res.writeHead(200, {
      "Content-Type": "text/css; charset=utf-8"
    });
    res.end(css);
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });
  res.end(await makePage(filePath));
}
async function forwardChange(wss, eventType, filePath) {
  if (eventType === "change") {
    const page = await makePage(filePath);
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(page);
      }
    }
  }
}
async function serve(filePath) {
  const server = http.createServer((req, res) => respond(req, res, filePath));
  const wss = new import_websocket_server.default({
    server
  });
  watch(filePath, (eventType) => forwardChange(wss, eventType, filePath));
  server.listen(4e3);
  await open_default("http://localhost:4000");
}

// ptls.js
import { argv } from "node:process";
async function run() {
  try {
    if (argv.length > 3) {
      await serve(argv[3]);
    } else if (argv.length > 2) {
      await getImport(argv[2], "./");
    } else {
      await repl();
    }
  } catch (err) {
    if (err instanceof Panic) {
      console.log(String(err));
    }
    throw err;
  }
}
run();
/**
 * @license
 * MIT License
 *
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
