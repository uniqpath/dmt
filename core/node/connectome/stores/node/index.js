'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var require$$0 = require('assert');
var require$$2 = require('events');
var require$$0$1 = require('util');
var require$$1 = require('worker_threads');
var url = require('url');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var require$$0$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);

function noop() {}

class RunnableLink {
  constructor(prev, next, fn) {
    this.prev = prev;
    this.next = next;
    this.fn = fn || noop;
  }

  run(data) {
    this.fn(data);
    this.next && this.next.run(data);
  }
}

class LinkedList {
  constructor(linkConstructor) {
    this.head = new RunnableLink();
    this.tail = new RunnableLink(this.head);
    this.head.next = this.tail;
    this.linkConstructor = linkConstructor;
    this.reg = {};
  }

  insert(data) {
    const link = new RunnableLink(this.tail.prev, this.tail, data);
    link.next.prev = link;
    link.prev.next = link;
    return link;
  }

  remove(link) {
    link.prev.next = link.next;
    link.next.prev = link.prev;
  }
}

let id = 0;

class Eev {
  constructor() {
    this.__events_list = {};
  }

  on(name, fn) {
    const list = this.__events_list[name] || (this.__events_list[name] = new LinkedList());
    const eev = fn._eev || (fn._eev = ++id);

    list.reg[eev] || (list.reg[eev] = list.insert(fn));
  }

  off(name, fn) {
    if (fn) {
      const list = this.__events_list[name];

      if (!list) {
        return;
      }

      const link = list.reg[fn._eev];

      list.reg[fn._eev] = undefined;

      list && link && list.remove(link);
    }
  }

  removeListener(...args) {
    this.off(...args);
  }

  emit(name, data) {
    const evt = this.__events_list[name];
    evt && evt.head.run(data);
  }
}

// LATER when browsers support check:
// https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
// also in Connectome library
function clone(obj) {
  if (typeof obj == 'function') {
    return obj;
  }
  var result = Array.isArray(obj) ? [] : {};
  for (var key in obj) {
    var value = obj[key];
    var type = {}.toString.call(value).slice(8, -1);
    if (type == 'Array' || type == 'Object') {
      result[key] = clone(value);
    } else if (type == 'Date') {
      result[key] = new Date(value.getTime());
    } else if (type == 'RegExp') {
      result[key] = RegExp(value.source, getRegExpFlags(value));
    } else {
      result[key] = value;
    }
  }
  return result;
}

function getRegExpFlags(regExp) {
  if (typeof regExp.source.flags == 'string') {
    return regExp.source.flags;
  } else {
    var flags = [];
    regExp.global && flags.push('g');
    regExp.ignoreCase && flags.push('i');
    regExp.multiline && flags.push('m');
    regExp.sticky && flags.push('y');
    regExp.unicode && flags.push('u');
    return flags.join('');
  }
}

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

function isObjectObject(o) {
  return isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor, prot;

  if (isObjectObject(o) === false) return false;

  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  return true;
}

function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, options) {
  return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
}

function defaultArrayMerge(target, source, options) {
  return target.concat(source).map(function(element) {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
}

function getMergeFunction(key, options) {
  if (!options.customMerge) {
    return deepmerge;
  }
  var customMerge = options.customMerge(key);
  return typeof customMerge === 'function' ? customMerge : deepmerge;
}

function mergeObject(target, source, options) {
  var destination = {};
  if (options.isMergeableObject(target)) {
    Object.keys(target).forEach(function(key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  Object.keys(source).forEach(function(key) {
    if (!options.isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    } else {
      destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    }
  });
  return destination;
}

function deepmerge(target, source, options) {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || isPlainObject;

  var sourceIsArray = Array.isArray(source);
  var targetIsArray = Array.isArray(target);
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
}

deepmerge.all = function deepmergeAll(array, options) {
  if (!Array.isArray(array)) {
    throw new Error('first argument should be an array');
  }

  return array.reduce(function(prev, next) {
    return deepmerge(prev, next, options);
  }, {});
};

/*
  primitives: value1 === value2
  functions: value1.toString == value2.toString
  arrays: if length, sequence and values of properties are identical
  objects: if length, names and values of properties are identical
  compare([[1, [2, 3]], [[1, [2, 3]]); // true
  compare([[1, [2, 3], 4], [[1, [2, 3]]); // false
  compare({a: 2, b: 3}, {a: 2, b: 3}); // true
  compare({a: 2, b: 3}, {b: 3, a: 2}); // true
  compare({a: 2, b: 3, c: 4}, {a: 2, b: 3}); // false
  compare({a: 2, b: 3}, {a: 2, b: 3, c: 4}); // false
  compare([[1, [2, {a: 4}], 4], [[1, [2, {a: 4}]]); // true
*/

function compare(value1, value2) {
  if (value1 === value2) {
    return true;
  }
  /* eslint-disable no-self-compare */
  // if both values are NaNs return true
  if (value1 !== value1 && value2 !== value2) {
    return true;
  }
  if ({}.toString.call(value1) != {}.toString.call(value2)) {
    return false;
  }
  if (value1 !== Object(value1)) {
    // non equal primitives
    return false;
  }
  if (!value1) {
    return false;
  }
  if (Array.isArray(value1)) {
    return compareArrays(value1, value2);
  }
  if ({}.toString.call(value1) == '[object Object]') {
    return compareObjects(value1, value2);
  } else {
    return compareNativeSubtypes(value1, value2);
  }
}

function compareNativeSubtypes(value1, value2) {
  // e.g. Function, RegExp, Date
  return value1.toString() === value2.toString();
}

function compareArrays(value1, value2) {
  var len = value1.length;
  if (len != value2.length) {
    return false;
  }
  var alike = true;
  for (var i = 0; i < len; i++) {
    if (!compare(value1[i], value2[i])) {
      alike = false;
      break;
    }
  }
  return alike;
}

function compareObjects(value1, value2) {
  var keys1 = Object.keys(value1).sort();
  var keys2 = Object.keys(value2).sort();
  var len = keys1.length;
  if (len != keys2.length) {
    return false;
  }
  for (var i = 0; i < len; i++) {
    var key1 = keys1[i];
    var key2 = keys2[i];
    if (!(key1 == key2 && compare(value1[key1], value2[key2]))) {
      return false;
    }
  }
  return true;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var pointer = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pointer = void 0;
/**
Unescape token part of a JSON Pointer string

`token` should *not* contain any '/' characters.

> Evaluation of each reference token begins by decoding any escaped
> character sequence.  This is performed by first transforming any
> occurrence of the sequence '~1' to '/', and then transforming any
> occurrence of the sequence '~0' to '~'.  By performing the
> substitutions in this order, an implementation avoids the error of
> turning '~01' first into '~1' and then into '/', which would be
> incorrect (the string '~01' correctly becomes '~1' after
> transformation).

Here's my take:

~1 is unescaped with higher priority than ~0 because it is a lower-order escape character.
I say "lower order" because '/' needs escaping due to the JSON Pointer serialization technique.
Whereas, '~' is escaped because escaping '/' uses the '~' character.
*/
function unescape(token) {
    return token.replace(/~1/g, '/').replace(/~0/g, '~');
}
/** Escape token part of a JSON Pointer string

> '~' needs to be encoded as '~0' and '/'
> needs to be encoded as '~1' when these characters appear in a
> reference token.

This is the exact inverse of `unescape()`, so the reverse replacements must take place in reverse order.
*/
function escape(token) {
    return token.replace(/~/g, '~0').replace(/\//g, '~1');
}
/**
JSON Pointer representation
*/
var Pointer = /** @class */ (function () {
    function Pointer(tokens) {
        if (tokens === void 0) { tokens = ['']; }
        this.tokens = tokens;
    }
    /**
    `path` *must* be a properly escaped string.
    */
    Pointer.fromJSON = function (path) {
        var tokens = path.split('/').map(unescape);
        if (tokens[0] !== '')
            throw new Error("Invalid JSON Pointer: " + path);
        return new Pointer(tokens);
    };
    Pointer.prototype.toString = function () {
        return this.tokens.map(escape).join('/');
    };
    /**
    Returns an object with 'parent', 'key', and 'value' properties.
    In the special case that this Pointer's path == "",
    this object will be {parent: null, key: '', value: object}.
    Otherwise, parent and key will have the property such that parent[key] == value.
    */
    Pointer.prototype.evaluate = function (object) {
        var parent = null;
        var key = '';
        var value = object;
        for (var i = 1, l = this.tokens.length; i < l; i++) {
            parent = value;
            key = this.tokens[i];
            // not sure if this the best way to handle non-existant paths...
            value = (parent || {})[key];
        }
        return { parent: parent, key: key, value: value };
    };
    Pointer.prototype.get = function (object) {
        return this.evaluate(object).value;
    };
    Pointer.prototype.set = function (object, value) {
        var cursor = object;
        for (var i = 1, l = this.tokens.length - 1, token = this.tokens[i]; i < l; i++) {
            // not sure if this the best way to handle non-existant paths...
            cursor = (cursor || {})[token];
        }
        if (cursor) {
            cursor[this.tokens[this.tokens.length - 1]] = value;
        }
    };
    Pointer.prototype.push = function (token) {
        // mutable
        this.tokens.push(token);
    };
    /**
    `token` should be a String. It'll be coerced to one anyway.
  
    immutable (shallowly)
    */
    Pointer.prototype.add = function (token) {
        var tokens = this.tokens.concat(String(token));
        return new Pointer(tokens);
    };
    return Pointer;
}());
exports.Pointer = Pointer;
});

var util = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = exports.objectType = exports.hasOwnProperty = void 0;
exports.hasOwnProperty = Object.prototype.hasOwnProperty;
function objectType(object) {
    if (object === undefined) {
        return 'undefined';
    }
    if (object === null) {
        return 'null';
    }
    if (Array.isArray(object)) {
        return 'array';
    }
    return typeof object;
}
exports.objectType = objectType;
function isNonPrimitive(value) {
    // loose-equality checking for null is faster than strict checking for each of null/undefined/true/false
    // checking null first, then calling typeof, is faster than vice-versa
    return value != null && typeof value == 'object';
}
/**
Recursively copy a value.

@param source - should be a JavaScript primitive, Array, or (plain old) Object.
@returns copy of source where every Array and Object have been recursively
         reconstructed from their constituent elements
*/
function clone(source) {
    if (!isNonPrimitive(source)) {
        // short-circuiting is faster than a single return
        return source;
    }
    // x.constructor == Array is the fastest way to check if x is an Array
    if (source.constructor == Array) {
        // construction via imperative for-loop is faster than source.map(arrayVsObject)
        var length_1 = source.length;
        // setting the Array length during construction is faster than just `[]` or `new Array()`
        var arrayTarget = new Array(length_1);
        for (var i = 0; i < length_1; i++) {
            arrayTarget[i] = clone(source[i]);
        }
        return arrayTarget;
    }
    // Object
    var objectTarget = {};
    // declaring the variable (with const) inside the loop is faster
    for (var key in source) {
        // hasOwnProperty costs a bit of performance, but it's semantically necessary
        // using a global helper is MUCH faster than calling source.hasOwnProperty(key)
        if (exports.hasOwnProperty.call(source, key)) {
            objectTarget[key] = clone(source[key]);
        }
    }
    return objectTarget;
}
exports.clone = clone;
});

var diff = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffAny = exports.diffObjects = exports.diffArrays = exports.intersection = exports.subtract = exports.isDestructive = void 0;
 // we only need this for type inference

function isDestructive(_a) {
    var op = _a.op;
    return op === 'remove' || op === 'replace' || op === 'copy' || op === 'move';
}
exports.isDestructive = isDestructive;
/**
List the keys in `minuend` that are not in `subtrahend`.

A key is only considered if it is both 1) an own-property (o.hasOwnProperty(k))
of the object, and 2) has a value that is not undefined. This is to match JSON
semantics, where JSON object serialization drops keys with undefined values.

@param minuend Object of interest
@param subtrahend Object of comparison
@returns Array of keys that are in `minuend` but not in `subtrahend`.
*/
function subtract(minuend, subtrahend) {
    // initialize empty object; we only care about the keys, the values can be anything
    var obj = {};
    // build up obj with all the properties of minuend
    for (var add_key in minuend) {
        if (util.hasOwnProperty.call(minuend, add_key) && minuend[add_key] !== undefined) {
            obj[add_key] = 1;
        }
    }
    // now delete all the properties of subtrahend from obj
    // (deleting a missing key has no effect)
    for (var del_key in subtrahend) {
        if (util.hasOwnProperty.call(subtrahend, del_key) && subtrahend[del_key] !== undefined) {
            delete obj[del_key];
        }
    }
    // finally, extract whatever keys remain in obj
    return Object.keys(obj);
}
exports.subtract = subtract;
/**
List the keys that shared by all `objects`.

The semantics of what constitutes a "key" is described in {@link subtract}.

@param objects Array of objects to compare
@returns Array of keys that are in ("own-properties" of) every object in `objects`.
*/
function intersection(objects) {
    var length = objects.length;
    // prepare empty counter to keep track of how many objects each key occurred in
    var counter = {};
    // go through each object and increment the counter for each key in that object
    for (var i = 0; i < length; i++) {
        var object = objects[i];
        for (var key in object) {
            if (util.hasOwnProperty.call(object, key) && object[key] !== undefined) {
                counter[key] = (counter[key] || 0) + 1;
            }
        }
    }
    // now delete all keys from the counter that were not seen in every object
    for (var key in counter) {
        if (counter[key] < length) {
            delete counter[key];
        }
    }
    // finally, extract whatever keys remain in the counter
    return Object.keys(counter);
}
exports.intersection = intersection;
function isArrayAdd(array_operation) {
    return array_operation.op === 'add';
}
function isArrayRemove(array_operation) {
    return array_operation.op === 'remove';
}
function appendArrayOperation(base, operation) {
    return {
        // the new operation must be pushed on the end
        operations: base.operations.concat(operation),
        cost: base.cost + 1,
    };
}
/**
Calculate the shortest sequence of operations to get from `input` to `output`,
using a dynamic programming implementation of the Levenshtein distance algorithm.

To get from the input ABC to the output AZ we could just delete all the input
and say "insert A, insert Z" and be done with it. That's what we do if the
input is empty. But we can be smarter.

          output
               A   Z
               -   -
          [0]  1   2
input A |  1  [0]  1
      B |  2  [1]  1
      C |  3   2  [2]

1) start at 0,0 (+0)
2) keep A (+0)
3) remove B (+1)
4) replace C with Z (+1)

If the `input` (source) is empty, they'll all be in the top row, resulting in an
array of 'add' operations.
If the `output` (target) is empty, everything will be in the left column,
resulting in an array of 'remove' operations.

@returns A list of add/remove/replace operations.
*/
function diffArrays(input, output, ptr, diff) {
    if (diff === void 0) { diff = diffAny; }
    // set up cost matrix (very simple initialization: just a map)
    var memo = {
        '0,0': { operations: [], cost: 0 },
    };
    /**
    Calculate the cheapest sequence of operations required to get from
    input.slice(0, i) to output.slice(0, j).
    There may be other valid sequences with the same cost, but none cheaper.
  
    @param i The row in the layout above
    @param j The column in the layout above
    @returns An object containing a list of operations, along with the total cost
             of applying them (+1 for each add/remove/replace operation)
    */
    function dist(i, j) {
        // memoized
        var memo_key = i + "," + j;
        var memoized = memo[memo_key];
        if (memoized === undefined) {
            // TODO: this !diff(...).length usage could/should be lazy
            if (i > 0 && j > 0 && !diff(input[i - 1], output[j - 1], new pointer.Pointer()).length) {
                // equal (no operations => no cost)
                memoized = dist(i - 1, j - 1);
            }
            else {
                var alternatives = [];
                if (i > 0) {
                    // NOT topmost row
                    var remove_base = dist(i - 1, j);
                    var remove_operation = {
                        op: 'remove',
                        index: i - 1,
                    };
                    alternatives.push(appendArrayOperation(remove_base, remove_operation));
                }
                if (j > 0) {
                    // NOT leftmost column
                    var add_base = dist(i, j - 1);
                    var add_operation = {
                        op: 'add',
                        index: i - 1,
                        value: output[j - 1],
                    };
                    alternatives.push(appendArrayOperation(add_base, add_operation));
                }
                if (i > 0 && j > 0) {
                    // TABLE MIDDLE
                    // supposing we replaced it, compute the rest of the costs:
                    var replace_base = dist(i - 1, j - 1);
                    // okay, the general plan is to replace it, but we can be smarter,
                    // recursing into the structure and replacing only part of it if
                    // possible, but to do so we'll need the original value
                    var replace_operation = {
                        op: 'replace',
                        index: i - 1,
                        original: input[i - 1],
                        value: output[j - 1],
                    };
                    alternatives.push(appendArrayOperation(replace_base, replace_operation));
                }
                // the only other case, i === 0 && j === 0, has already been memoized
                // the meat of the algorithm:
                // sort by cost to find the lowest one (might be several ties for lowest)
                // [4, 6, 7, 1, 2].sort((a, b) => a - b) -> [ 1, 2, 4, 6, 7 ]
                var best = alternatives.sort(function (a, b) { return a.cost - b.cost; })[0];
                memoized = best;
            }
            memo[memo_key] = memoized;
        }
        return memoized;
    }
    // handle weird objects masquerading as Arrays that don't have proper length
    // properties by using 0 for everything but positive numbers
    var input_length = (isNaN(input.length) || input.length <= 0) ? 0 : input.length;
    var output_length = (isNaN(output.length) || output.length <= 0) ? 0 : output.length;
    var array_operations = dist(input_length, output_length).operations;
    var padded_operations = array_operations.reduce(function (_a, array_operation) {
        var operations = _a[0], padding = _a[1];
        if (isArrayAdd(array_operation)) {
            var padded_index = array_operation.index + 1 + padding;
            var index_token = padded_index < (input_length + padding) ? String(padded_index) : '-';
            var operation = {
                op: array_operation.op,
                path: ptr.add(index_token).toString(),
                value: array_operation.value,
            };
            // padding++ // maybe only if array_operation.index > -1 ?
            return [operations.concat(operation), padding + 1];
        }
        else if (isArrayRemove(array_operation)) {
            var operation = {
                op: array_operation.op,
                path: ptr.add(String(array_operation.index + padding)).toString(),
            };
            // padding--
            return [operations.concat(operation), padding - 1];
        }
        else { // replace
            var replace_ptr = ptr.add(String(array_operation.index + padding));
            var replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
            return [operations.concat.apply(operations, replace_operations), padding];
        }
    }, [[], 0])[0];
    return padded_operations;
}
exports.diffArrays = diffArrays;
function diffObjects(input, output, ptr, diff) {
    if (diff === void 0) { diff = diffAny; }
    // if a key is in input but not output -> remove it
    var operations = [];
    subtract(input, output).forEach(function (key) {
        operations.push({ op: 'remove', path: ptr.add(key).toString() });
    });
    // if a key is in output but not input -> add it
    subtract(output, input).forEach(function (key) {
        operations.push({ op: 'add', path: ptr.add(key).toString(), value: output[key] });
    });
    // if a key is in both, diff it recursively
    intersection([input, output]).forEach(function (key) {
        operations.push.apply(operations, diff(input[key], output[key], ptr.add(key)));
    });
    return operations;
}
exports.diffObjects = diffObjects;
/**
`diffAny()` returns an empty array if `input` and `output` are materially equal
(i.e., would produce equivalent JSON); otherwise it produces an array of patches
that would transform `input` into `output`.

> Here, "equal" means that the value at the target location and the
> value conveyed by "value" are of the same JSON type, and that they
> are considered equal by the following rules for that type:
> o  strings: are considered equal if they contain the same number of
>    Unicode characters and their code points are byte-by-byte equal.
> o  numbers: are considered equal if their values are numerically
>    equal.
> o  arrays: are considered equal if they contain the same number of
>    values, and if each value can be considered equal to the value at
>    the corresponding position in the other array, using this list of
>    type-specific rules.
> o  objects: are considered equal if they contain the same number of
>    members, and if each member can be considered equal to a member in
>    the other object, by comparing their keys (as strings) and their
>    values (using this list of type-specific rules).
> o  literals (false, true, and null): are considered equal if they are
>    the same.
*/
function diffAny(input, output, ptr, diff) {
    if (diff === void 0) { diff = diffAny; }
    // strict equality handles literals, numbers, and strings (a sufficient but not necessary cause)
    if (input === output) {
        return [];
    }
    var input_type = util.objectType(input);
    var output_type = util.objectType(output);
    if (input_type == 'array' && output_type == 'array') {
        return diffArrays(input, output, ptr, diff);
    }
    if (input_type == 'object' && output_type == 'object') {
        return diffObjects(input, output, ptr, diff);
    }
    // at this point we know that input and output are materially different;
    // could be array -> object, object -> array, boolean -> undefined,
    // number -> string, or some other combination, but nothing that can be split
    // up into multiple patches: so `output` must replace `input` wholesale.
    return [{ op: 'replace', path: ptr.toString(), value: output }];
}
exports.diffAny = diffAny;
});

var patch = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.InvalidOperationError = exports.test = exports.copy = exports.move = exports.replace = exports.remove = exports.add = exports.TestError = exports.MissingError = void 0;



var MissingError = /** @class */ (function (_super) {
    __extends(MissingError, _super);
    function MissingError(path) {
        var _this = _super.call(this, "Value required at path: " + path) || this;
        _this.path = path;
        _this.name = 'MissingError';
        return _this;
    }
    return MissingError;
}(Error));
exports.MissingError = MissingError;
var TestError = /** @class */ (function (_super) {
    __extends(TestError, _super);
    function TestError(actual, expected) {
        var _this = _super.call(this, "Test failed: " + actual + " != " + expected) || this;
        _this.actual = actual;
        _this.expected = expected;
        _this.name = 'TestError';
        return _this;
    }
    return TestError;
}(Error));
exports.TestError = TestError;
function _add(object, key, value) {
    if (Array.isArray(object)) {
        // `key` must be an index
        if (key == '-') {
            object.push(value);
        }
        else {
            var index = parseInt(key, 10);
            object.splice(index, 0, value);
        }
    }
    else {
        object[key] = value;
    }
}
function _remove(object, key) {
    if (Array.isArray(object)) {
        // '-' syntax doesn't make sense when removing
        var index = parseInt(key, 10);
        object.splice(index, 1);
    }
    else {
        // not sure what the proper behavior is when path = ''
        delete object[key];
    }
}
/**
>  o  If the target location specifies an array index, a new value is
>     inserted into the array at the specified index.
>  o  If the target location specifies an object member that does not
>     already exist, a new member is added to the object.
>  o  If the target location specifies an object member that does exist,
>     that member's value is replaced.
*/
function add(object, operation) {
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    // it's not exactly a "MissingError" in the same way that `remove` is -- more like a MissingParent, or something
    if (endpoint.parent === undefined) {
        return new MissingError(operation.path);
    }
    _add(endpoint.parent, endpoint.key, util.clone(operation.value));
    return null;
}
exports.add = add;
/**
> The "remove" operation removes the value at the target location.
> The target location MUST exist for the operation to be successful.
*/
function remove(object, operation) {
    // endpoint has parent, key, and value properties
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.value === undefined) {
        return new MissingError(operation.path);
    }
    // not sure what the proper behavior is when path = ''
    _remove(endpoint.parent, endpoint.key);
    return null;
}
exports.remove = remove;
/**
> The "replace" operation replaces the value at the target location
> with a new value.  The operation object MUST contain a "value" member
> whose content specifies the replacement value.
> The target location MUST exist for the operation to be successful.

> This operation is functionally identical to a "remove" operation for
> a value, followed immediately by an "add" operation at the same
> location with the replacement value.

Even more simply, it's like the add operation with an existence check.
*/
function replace(object, operation) {
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.parent === null) {
        return new MissingError(operation.path);
    }
    // this existence check treats arrays as a special case
    if (Array.isArray(endpoint.parent)) {
        if (parseInt(endpoint.key, 10) >= endpoint.parent.length) {
            return new MissingError(operation.path);
        }
    }
    else if (endpoint.value === undefined) {
        return new MissingError(operation.path);
    }
    endpoint.parent[endpoint.key] = operation.value;
    return null;
}
exports.replace = replace;
/**
> The "move" operation removes the value at a specified location and
> adds it to the target location.
> The operation object MUST contain a "from" member, which is a string
> containing a JSON Pointer value that references the location in the
> target document to move the value from.
> This operation is functionally identical to a "remove" operation on
> the "from" location, followed immediately by an "add" operation at
> the target location with the value that was just removed.

> The "from" location MUST NOT be a proper prefix of the "path"
> location; i.e., a location cannot be moved into one of its children.

TODO: throw if the check described in the previous paragraph fails.
*/
function move(object, operation) {
    var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
    if (from_endpoint.value === undefined) {
        return new MissingError(operation.from);
    }
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.parent === undefined) {
        return new MissingError(operation.path);
    }
    _remove(from_endpoint.parent, from_endpoint.key);
    _add(endpoint.parent, endpoint.key, from_endpoint.value);
    return null;
}
exports.move = move;
/**
> The "copy" operation copies the value at a specified location to the
> target location.
> The operation object MUST contain a "from" member, which is a string
> containing a JSON Pointer value that references the location in the
> target document to copy the value from.
> The "from" location MUST exist for the operation to be successful.

> This operation is functionally identical to an "add" operation at the
> target location using the value specified in the "from" member.

Alternatively, it's like 'move' without the 'remove'.
*/
function copy(object, operation) {
    var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
    if (from_endpoint.value === undefined) {
        return new MissingError(operation.from);
    }
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.parent === undefined) {
        return new MissingError(operation.path);
    }
    _add(endpoint.parent, endpoint.key, util.clone(from_endpoint.value));
    return null;
}
exports.copy = copy;
/**
> The "test" operation tests that a value at the target location is
> equal to a specified value.
> The operation object MUST contain a "value" member that conveys the
> value to be compared to the target location's value.
> The target location MUST be equal to the "value" value for the
> operation to be considered successful.
*/
function test(object, operation) {
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    // TODO: this diffAny(...).length usage could/should be lazy
    if (diff.diffAny(endpoint.value, operation.value, new pointer.Pointer()).length) {
        return new TestError(endpoint.value, operation.value);
    }
    return null;
}
exports.test = test;
var InvalidOperationError = /** @class */ (function (_super) {
    __extends(InvalidOperationError, _super);
    function InvalidOperationError(operation) {
        var _this = _super.call(this, "Invalid operation: " + operation.op) || this;
        _this.operation = operation;
        _this.name = 'InvalidOperationError';
        return _this;
    }
    return InvalidOperationError;
}(Error));
exports.InvalidOperationError = InvalidOperationError;
/**
Switch on `operation.op`, applying the corresponding patch function for each
case to `object`.
*/
function apply(object, operation) {
    // not sure why TypeScript can't infer typesafety of:
    //   {add, remove, replace, move, copy, test}[operation.op](object, operation)
    // (seems like a bug)
    switch (operation.op) {
        case 'add': return add(object, operation);
        case 'remove': return remove(object, operation);
        case 'replace': return replace(object, operation);
        case 'move': return move(object, operation);
        case 'copy': return copy(object, operation);
        case 'test': return test(object, operation);
    }
    return new InvalidOperationError(operation);
}
exports.apply = apply;
});

var rfc6902 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTests = exports.createPatch = exports.applyPatch = void 0;



/**
Apply a 'application/json-patch+json'-type patch to an object.

`patch` *must* be an array of operations.

> Operation objects MUST have exactly one "op" member, whose value
> indicates the operation to perform.  Its value MUST be one of "add",
> "remove", "replace", "move", "copy", or "test"; other values are
> errors.

This method mutates the target object in-place.

@returns list of results, one for each operation: `null` indicated success,
         otherwise, the result will be an instance of one of the Error classes:
         MissingError, InvalidOperationError, or TestError.
*/
function applyPatch(object, patch$1) {
    return patch$1.map(function (operation) { return patch.apply(object, operation); });
}
exports.applyPatch = applyPatch;
function wrapVoidableDiff(diff$1) {
    function wrappedDiff(input, output, ptr) {
        var custom_patch = diff$1(input, output, ptr);
        // ensure an array is always returned
        return Array.isArray(custom_patch) ? custom_patch : diff.diffAny(input, output, ptr, wrappedDiff);
    }
    return wrappedDiff;
}
/**
Produce a 'application/json-patch+json'-type patch to get from one object to
another.

This does not alter `input` or `output` unless they have a property getter with
side-effects (which is not a good idea anyway).

`diff` is called on each pair of comparable non-primitive nodes in the
`input`/`output` object trees, producing nested patches. Return `undefined`
to fall back to default behaviour.

Returns list of operations to perform on `input` to produce `output`.
*/
function createPatch(input, output, diff$1) {
    var ptr = new pointer.Pointer();
    // a new Pointer gets a default path of [''] if not specified
    return (diff$1 ? wrapVoidableDiff(diff$1) : diff.diffAny)(input, output, ptr);
}
exports.createPatch = createPatch;
/**
Create a test operation based on `input`'s current evaluation of the JSON
Pointer `path`; if such a pointer cannot be resolved, returns undefined.
*/
function createTest(input, path) {
    var endpoint = pointer.Pointer.fromJSON(path).evaluate(input);
    if (endpoint !== undefined) {
        return { op: 'test', path: path, value: endpoint.value };
    }
}
/**
Produce an 'application/json-patch+json'-type list of tests, to verify that
existing values in an object are identical to the those captured at some
checkpoint (whenever this function is called).

This does not alter `input` or `output` unless they have a property getter with
side-effects (which is not a good idea anyway).

Returns list of test operations.
*/
function createTests(input, patch) {
    var tests = new Array();
    patch.filter(diff.isDestructive).forEach(function (operation) {
        var pathTest = createTest(input, operation.path);
        if (pathTest)
            tests.push(pathTest);
        if ('from' in operation) {
            var fromTest = createTest(input, operation.from);
            if (fromTest)
                tests.push(fromTest);
        }
    });
    return tests;
}
exports.createTests = createTests;
});

var rfc6902$1 = /*@__PURE__*/getDefaultExportFromCjs(rfc6902);

const generateJsonPatch = rfc6902$1.createPatch;

function mergeState(state, patch) {
  const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
  return deepmerge(state, patch, { arrayMerge: overwriteMerge });
}

class KeyValueStore {
  constructor() {
    this.state = {};
  }

  // dangerous :)
  // set(state) {
  //   this.state = state;
  // }

  update(patch) {
    this.state = mergeState(this.state, patch);
  }

  replaceBaseKey(baseKey, value) {
    this.state[baseKey] = value;
  }

  clearBaseKey(baseKey) {
    delete this.state[baseKey];
  }

  replaceSubKey({ baseKey, key, value }) {
    this.state[baseKey] = this.state[baseKey] || {};
    this.state[baseKey][key] = value;
  }

  removeSubKey({ baseKey, key }) {
    this.state[baseKey] = this.state[baseKey] || {};
    const found = this.state[baseKey][key] != undefined;
    delete this.state[baseKey][key];
    return found;
  }

  push(baseKey, value) {
    this.state[baseKey].push(value);
  }

  updateArrayElements(baseKey, selectorPredicate, value) {
    let hasUpdated;

    for (const entry of this.state[baseKey].filter(entry => selectorPredicate(entry))) {
      // in-place replace entry completely (array reference stays the same)
      //Object.keys(entry).forEach(key => delete entry[key]);
      Object.assign(entry, value);
      hasUpdated = true;
    }

    return hasUpdated;
  }

  // return true if anything was removed
  removeArrayElements(baseKey, removePredicate) {
    const prevLength = this.state[baseKey].length;
    this.state[baseKey] = this.state[baseKey].filter(entry => !removePredicate(entry));
    return prevLength != this.state[baseKey].length;
  }

  replaceArrayElement(baseKey, selectorPredicate, value) {
    const entry = this.state[baseKey].find(entry => selectorPredicate(entry));

    if (entry) {
      // in-place replace entry completely (array reference stays the same)
      Object.keys(entry).forEach(key => delete entry[key]);
      Object.assign(entry, value);
      return true;
    }
  }

  sortArray(baseKey, compareFn) {
    this.state[baseKey].sort(compareFn);
  }
}

class Slot {
  constructor({ name, parent }) {
    this.name = name;
    this.parent = parent;
  }

  makeArray() {
    if (!Array.isArray(this.get())) {
      this.set([], { announce: false });
    }
    return this;
  }

  muteAnnounce(callback) {
    this._muteAnnounce = true;
    this.muteAnnounceCallback = callback;
  }

  mutesAnnounce() {
    return this._muteAnnounce;
  }

  get(key) {
    const slotState = this.parent.get(this.name) || {};
    return key ? slotState[key] : slotState;
  }

  set(state, { announce = true } = {}) {
    this.parent.kvStore.replaceBaseKey(this.name, state);
    this.parent.announceStateChange(announce);
  }

  update(patch, { announce = true } = {}) {
    const _patch = {};
    _patch[this.name] = patch;
    this.parent.update(_patch, { announce });
  }

  remove({ announce = true } = {}) {
    this.parent.kvStore.clearBaseKey(this.name);
    this.parent.announceStateChange(announce);
  }

  removeKey(key, { announce = true } = {}) {
    if (this.parent.kvStore.removeSubKey({ baseKey: this.name, key })) {
      this.parent.announceStateChange(announce);
    }
  }

  removeKeys(keys, { announce = true } = {}) {
    for (const key of keys) {
      this.parent.kvStore.removeSubKey({ baseKey: this.name, key });
    }
    this.parent.announceStateChange(announce);
  }

  push(element, { announce = true } = {}) {
    this.parent.kvStore.push(this.name, element);
    this.parent.announceStateChange(announce);
  }

  updateArrayElements(selectorPredicate, value, { announce = true } = {}) {
    const foundMatches = this.parent.kvStore.updateArrayElements(this.name, selectorPredicate, value);
    if (foundMatches) {
      this.parent.announceStateChange(announce);
    }
  }

  removeArrayElements(selectorPredicate, { announce = true } = {}) {
    const removed = this.parent.kvStore.removeArrayElements(this.name, selectorPredicate);
    this.parent.announceStateChange(removed && announce);
  }

  replaceArrayElement(selectorPredicate, value, { announce = true } = {}) {
    const foundMatch = this.parent.kvStore.replaceArrayElement(this.name, selectorPredicate, value);
    if (foundMatch) {
      this.parent.announceStateChange(announce);
      return true;
    }
  }

  setArrayElement(selectorPredicate, value, { announce = true } = {}) {
    if (!this.replaceArrayElement(selectorPredicate, value, { announce })) {
      this.push(value, { announce });
    }
  }

  sortArray(compareFn, { announce = true }) {
    this.parent.kvStore.sortArray(this.name, compareFn);
    this.parent.announceStateChange(announce);
  }
}

function getDiff(prevAnnouncedState, currentState) {
  const diff = generateJsonPatch(prevAnnouncedState, currentState);

  if (diff.length > 0) {
    return diff;
  }
}

function removeUnsaved(state, unsavedSlots, beforeLoadAndSave) {
  for (const slotName of unsavedSlots) {
    delete state[slotName];
  }

  beforeLoadAndSave(state);

  return state;
}

function muteAnnounce(slots, state) {
  for (const slotName of Object.keys(state)) {
    if (slots[slotName]?.mutesAnnounce()) {
      const { muteAnnounceCallback } = slots[slotName];

      if (muteAnnounceCallback) {
        muteAnnounceCallback(state[slotName]);
      } else {
        delete state[slotName];
      }
    }
  }

  return state;
}

const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href))); // this is used in the code and just transpiling is not enough, we need to add _filename global

var commonjsGlobal$1 =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {};

function createCommonjsModule$1(fn, basedir, module) {
  return (
    (module = {
      path: basedir,
      exports: {},
      require: function (path, base) {
        return commonjsRequire$1(path, base === undefined || base === null ? module.path : base);
      }
    }),
    fn(module, module.exports),
    module.exports
  );
}

function commonjsRequire$1() {
  throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var imurmurhash = createCommonjsModule$1(function (module) {
  /**
   * @preserve
   * JS Implementation of incremental MurmurHash3 (r150) (as of May 10, 2013)
   *
   * @author <a href="mailto:jensyt@gmail.com">Jens Taylor</a>
   * @see http://github.com/homebrewing/brauhaus-diff
   * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
   * @see http://github.com/garycourt/murmurhash-js
   * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
   * @see http://sites.google.com/site/murmurhash/
   */
  (function () {
    var cache;

    // Call this function without `new` to use the cached object (good for
    // single-threaded environments), or with `new` to create a new object.
    //
    // @param {string} key A UTF-16 or ASCII string
    // @param {number} seed An optional positive integer
    // @return {object} A MurmurHash3 object for incremental hashing
    function MurmurHash3(key, seed) {
      var m = this instanceof MurmurHash3 ? this : cache;
      m.reset(seed);
      if (typeof key === 'string' && key.length > 0) {
        m.hash(key);
      }

      if (m !== this) {
        return m;
      }
    }
    // Incrementally add a string to this hash
    //
    // @param {string} key A UTF-16 or ASCII string
    // @return {object} this
    MurmurHash3.prototype.hash = function (key) {
      var h1, k1, i, top, len;

      len = key.length;
      this.len += len;

      k1 = this.k1;
      i = 0;
      switch (this.rem) {
        case 0:
          k1 ^= len > i ? key.charCodeAt(i++) & 0xffff : 0;
        case 1:
          k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 8 : 0;
        case 2:
          k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 16 : 0;
        case 3:
          k1 ^= len > i ? (key.charCodeAt(i) & 0xff) << 24 : 0;
          k1 ^= len > i ? (key.charCodeAt(i++) & 0xff00) >> 8 : 0;
      }

      this.rem = (len + this.rem) & 3; // & 3 is same as % 4
      len -= this.rem;
      if (len > 0) {
        h1 = this.h1;
        while (1) {
          k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
          k1 = (k1 << 15) | (k1 >>> 17);
          k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;

          h1 ^= k1;
          h1 = (h1 << 13) | (h1 >>> 19);
          h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff;

          if (i >= len) {
            break;
          }

          k1 =
            (key.charCodeAt(i++) & 0xffff) ^
            ((key.charCodeAt(i++) & 0xffff) << 8) ^
            ((key.charCodeAt(i++) & 0xffff) << 16);
          top = key.charCodeAt(i++);
          k1 ^= ((top & 0xff) << 24) ^ ((top & 0xff00) >> 8);
        }

        k1 = 0;
        switch (this.rem) {
          case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xffff) << 16;
          case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xffff) << 8;
          case 1:
            k1 ^= key.charCodeAt(i) & 0xffff;
        }

        this.h1 = h1;
      }

      this.k1 = k1;
      return this;
    };

    // Get the result of this hash
    //
    // @return {number} The 32-bit hash
    MurmurHash3.prototype.result = function () {
      var k1, h1;

      k1 = this.k1;
      h1 = this.h1;

      if (k1 > 0) {
        k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;
        h1 ^= k1;
      }

      h1 ^= this.len;

      h1 ^= h1 >>> 16;
      h1 = (h1 * 0xca6b + (h1 & 0xffff) * 0x85eb0000) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = (h1 * 0xae35 + (h1 & 0xffff) * 0xc2b20000) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    };

    // Reset the hash object for reuse
    //
    // @param {number} seed An optional positive integer
    MurmurHash3.prototype.reset = function (seed) {
      this.h1 = typeof seed === 'number' ? seed : 0;
      this.rem = this.k1 = this.len = 0;
      return this;
    };

    // A cached object to use. This can be safely used if you're in a single-
    // threaded environment, otherwise you need to create new hashes to use.
    cache = new MurmurHash3();

    {
      module.exports = MurmurHash3;
    }
  })();
});

var signals = createCommonjsModule$1(function (module) {
  // This is not the set of all possible signals.
  //
  // It IS, however, the set of all signals that trigger
  // an exit on either Linux or BSD systems.  Linux is a
  // superset of the signal names supported on BSD, and
  // the unknown signals just fail to register, so we can
  // catch that easily enough.
  //
  // Don't bother with SIGKILL.  It's uncatchable, which
  // means that we can't fire any callbacks anyway.
  //
  // If a user does happen to register a handler on a non-
  // fatal signal like SIGWINCH or something, and then
  // exit, it'll end up firing `process.emit('exit')`, so
  // the handler will be fired anyway.
  //
  // SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
  // artificially, inherently leave the process in a
  // state from which it is not safe to try and enter JS
  // listeners.
  module.exports = ['SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGTERM'];

  if (process.platform !== 'win32') {
    module.exports.push(
      'SIGVTALRM',
      'SIGXCPU',
      'SIGXFSZ',
      'SIGUSR2',
      'SIGTRAP',
      'SIGSYS',
      'SIGQUIT',
      'SIGIOT'
      // should detect profiler and enable/disable accordingly.
      // see #21
      // 'SIGPROF'
    );
  }

  if (process.platform === 'linux') {
    module.exports.push('SIGIO', 'SIGPOLL', 'SIGPWR', 'SIGSTKFLT', 'SIGUNUSED');
  }
});

var signalExit = createCommonjsModule$1(function (module) {
  // Note: since nyc uses this module to output coverage, any lines
  // that are in the direct sync flow of nyc's outputCoverage are
  // ignored, since we can never get coverage for them.
  // grab a reference to node's real process object right away
  var process = commonjsGlobal$1.process;

  const processOk = function (process) {
    return (
      process &&
      typeof process === 'object' &&
      typeof process.removeListener === 'function' &&
      typeof process.emit === 'function' &&
      typeof process.reallyExit === 'function' &&
      typeof process.listeners === 'function' &&
      typeof process.kill === 'function' &&
      typeof process.pid === 'number' &&
      typeof process.on === 'function'
    );
  };

  // some kind of non-node environment, just no-op
  /* istanbul ignore if */
  if (!processOk(process)) {
    module.exports = function () {
      return function () {};
    };
  } else {
    var assert = require$$0__default['default'];
    var signals$1 = signals;
    var isWin = /^win/i.test(process.platform);

    var EE = require$$2__default['default'];
    /* istanbul ignore if */
    if (typeof EE !== 'function') {
      EE = EE.EventEmitter;
    }

    var emitter;
    if (process.__signal_exit_emitter__) {
      emitter = process.__signal_exit_emitter__;
    } else {
      emitter = process.__signal_exit_emitter__ = new EE();
      emitter.count = 0;
      emitter.emitted = {};
    }

    // Because this emitter is a global, we have to check to see if a
    // previous version of this library failed to enable infinite listeners.
    // I know what you're about to say.  But literally everything about
    // signal-exit is a compromise with evil.  Get used to it.
    if (!emitter.infinite) {
      emitter.setMaxListeners(Infinity);
      emitter.infinite = true;
    }

    module.exports = function (cb, opts) {
      /* istanbul ignore if */
      if (!processOk(commonjsGlobal$1.process)) {
        return function () {};
      }
      assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

      if (loaded === false) {
        load();
      }

      var ev = 'exit';
      if (opts && opts.alwaysLast) {
        ev = 'afterexit';
      }

      var remove = function () {
        emitter.removeListener(ev, cb);
        if (emitter.listeners('exit').length === 0 && emitter.listeners('afterexit').length === 0) {
          unload();
        }
      };
      emitter.on(ev, cb);

      return remove;
    };

    var unload = function unload() {
      if (!loaded || !processOk(commonjsGlobal$1.process)) {
        return;
      }
      loaded = false;

      signals$1.forEach(function (sig) {
        try {
          process.removeListener(sig, sigListeners[sig]);
        } catch (er) {}
      });
      process.emit = originalProcessEmit;
      process.reallyExit = originalProcessReallyExit;
      emitter.count -= 1;
    };
    module.exports.unload = unload;

    var emit = function emit(event, code, signal) {
      /* istanbul ignore if */
      if (emitter.emitted[event]) {
        return;
      }
      emitter.emitted[event] = true;
      emitter.emit(event, code, signal);
    };

    // { <signal>: <listener fn>, ... }
    var sigListeners = {};
    signals$1.forEach(function (sig) {
      sigListeners[sig] = function listener() {
        /* istanbul ignore if */
        if (!processOk(commonjsGlobal$1.process)) {
          return;
        }
        // If there are no other listeners, an exit is coming!
        // Simplest way: remove us and then re-send the signal.
        // We know that this will kill the process, so we can
        // safely emit now.
        var listeners = process.listeners(sig);
        if (listeners.length === emitter.count) {
          unload();
          emit('exit', null, sig);
          /* istanbul ignore next */
          emit('afterexit', null, sig);
          /* istanbul ignore next */
          if (isWin && sig === 'SIGHUP') {
            // "SIGHUP" throws an `ENOSYS` error on Windows,
            // so use a supported signal instead
            sig = 'SIGINT';
          }
          /* istanbul ignore next */
          process.kill(process.pid, sig);
        }
      };
    });

    module.exports.signals = function () {
      return signals$1;
    };

    var loaded = false;

    var load = function load() {
      if (loaded || !processOk(commonjsGlobal$1.process)) {
        return;
      }
      loaded = true;

      // This is the number of onSignalExit's that are in play.
      // It's important so that we can count the correct number of
      // listeners on signals, and don't wait for the other one to
      // handle it instead of us.
      emitter.count += 1;

      signals$1 = signals$1.filter(function (sig) {
        try {
          process.on(sig, sigListeners[sig]);
          return true;
        } catch (er) {
          return false;
        }
      });

      process.emit = processEmit;
      process.reallyExit = processReallyExit;
    };
    module.exports.load = load;

    var originalProcessReallyExit = process.reallyExit;
    var processReallyExit = function processReallyExit(code) {
      /* istanbul ignore if */
      if (!processOk(commonjsGlobal$1.process)) {
        return;
      }
      process.exitCode = code || /* istanbul ignore next */ 0;
      emit('exit', process.exitCode, null);
      /* istanbul ignore next */
      emit('afterexit', process.exitCode, null);
      /* istanbul ignore next */
      originalProcessReallyExit.call(process, process.exitCode);
    };

    var originalProcessEmit = process.emit;
    var processEmit = function processEmit(ev, arg) {
      if (ev === 'exit' && processOk(commonjsGlobal$1.process)) {
        /* istanbul ignore else */
        if (arg !== undefined) {
          process.exitCode = arg;
        }
        var ret = originalProcessEmit.apply(this, arguments);
        /* istanbul ignore next */
        emit('exit', process.exitCode, null);
        /* istanbul ignore next */
        emit('afterexit', process.exitCode, null);
        /* istanbul ignore next */
        return ret;
      } else {
        return originalProcessEmit.apply(this, arguments);
      }
    };
  }
});

var lib = writeFile;
var sync = writeFileSync;
var _getTmpname = getTmpname; // for testing
var _cleanupOnExit = cleanupOnExit;

const { promisify } = require$$0$1__default['default'];
const activeFiles = {};

// if we run inside of a worker_thread, `process.pid` is not unique
/* istanbul ignore next */
const threadId = (function getId() {
  try {
    const workerThreads = require$$1__default['default'];

    /// if we are in main thread, this is set to `0`
    return workerThreads.threadId;
  } catch (e) {
    // worker_threads are not available, fallback to 0
    return 0;
  }
})();

let invocations = 0;
function getTmpname(filename) {
  return (
    filename +
    '.' +
    imurmurhash(__filename$1)
      .hash(String(process.pid))
      .hash(String(threadId))
      .hash(String(++invocations))
      .result()
  );
}

function cleanupOnExit(tmpfile) {
  return () => {
    try {
      fs__default['default'].unlinkSync(typeof tmpfile === 'function' ? tmpfile() : tmpfile);
    } catch (_) {}
  };
}

function serializeActiveFile(absoluteName) {
  return new Promise(resolve => {
    // make a queue if it doesn't already exist
    if (!activeFiles[absoluteName]) {
      activeFiles[absoluteName] = [];
    }

    activeFiles[absoluteName].push(resolve); // add this job to the queue
    if (activeFiles[absoluteName].length === 1) {
      resolve();
    } // kick off the first one
  });
}

// https://github.com/isaacs/node-graceful-fs/blob/master/polyfills.js#L315-L342
function isChownErrOk(err) {
  if (err.code === 'ENOSYS') {
    return true;
  }

  const nonroot = !process.getuid || process.getuid() !== 0;
  if (nonroot) {
    if (err.code === 'EINVAL' || err.code === 'EPERM') {
      return true;
    }
  }

  return false;
}

async function writeFileAsync(filename, data, options = {}) {
  if (typeof options === 'string') {
    options = { encoding: options };
  }

  let fd;
  let tmpfile;
  /* istanbul ignore next -- The closure only gets called when onExit triggers */
  const removeOnExitHandler = signalExit(cleanupOnExit(() => tmpfile));
  const absoluteName = path__default['default'].resolve(filename);

  try {
    await serializeActiveFile(absoluteName);
    const truename = await promisify(fs__default['default'].realpath)(filename).catch(() => filename);
    tmpfile = getTmpname(truename);

    if (!options.mode || !options.chown) {
      // Either mode or chown is not explicitly set
      // Default behavior is to copy it from original file
      const stats = await promisify(fs__default['default'].stat)(truename).catch(() => {});
      if (stats) {
        if (options.mode == null) {
          options.mode = stats.mode;
        }

        if (options.chown == null && process.getuid) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
      }
    }

    fd = await promisify(fs__default['default'].open)(tmpfile, 'w', options.mode);
    if (options.tmpfileCreated) {
      await options.tmpfileCreated(tmpfile);
    }
    if (ArrayBuffer.isView(data)) {
      await promisify(fs__default['default'].write)(fd, data, 0, data.length, 0);
    } else if (data != null) {
      await promisify(fs__default['default'].write)(fd, String(data), 0, String(options.encoding || 'utf8'));
    }

    if (options.fsync !== false) {
      await promisify(fs__default['default'].fsync)(fd);
    }

    await promisify(fs__default['default'].close)(fd);
    fd = null;

    if (options.chown) {
      await promisify(fs__default['default'].chown)(tmpfile, options.chown.uid, options.chown.gid).catch(err => {
        if (!isChownErrOk(err)) {
          throw err;
        }
      });
    }

    if (options.mode) {
      await promisify(fs__default['default'].chmod)(tmpfile, options.mode).catch(err => {
        if (!isChownErrOk(err)) {
          throw err;
        }
      });
    }

    await promisify(fs__default['default'].rename)(tmpfile, truename);
  } finally {
    if (fd) {
      await promisify(fs__default['default'].close)(fd).catch(
        /* istanbul ignore next */
        () => {}
      );
    }
    removeOnExitHandler();
    await promisify(fs__default['default'].unlink)(tmpfile).catch(() => {});
    activeFiles[absoluteName].shift(); // remove the element added by serializeSameFile
    if (activeFiles[absoluteName].length > 0) {
      activeFiles[absoluteName][0](); // start next job if one is pending
    } else {
      delete activeFiles[absoluteName];
    }
  }
}

function writeFile(filename, data, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  const promise = writeFileAsync(filename, data, options);
  if (callback) {
    promise.then(callback, callback);
  }

  return promise;
}

function writeFileSync(filename, data, options) {
  if (typeof options === 'string') {
    options = { encoding: options };
  } else if (!options) {
    options = {};
  }
  try {
    filename = fs__default['default'].realpathSync(filename);
  } catch (ex) {
    // it's ok, it'll happen on a not yet existing file
  }
  const tmpfile = getTmpname(filename);

  if (!options.mode || !options.chown) {
    // Either mode or chown is not explicitly set
    // Default behavior is to copy it from original file
    try {
      const stats = fs__default['default'].statSync(filename);
      options = Object.assign({}, options);
      if (!options.mode) {
        options.mode = stats.mode;
      }
      if (!options.chown && process.getuid) {
        options.chown = { uid: stats.uid, gid: stats.gid };
      }
    } catch (ex) {
      // ignore stat errors
    }
  }

  let fd;
  const cleanup = cleanupOnExit(tmpfile);
  const removeOnExitHandler = signalExit(cleanup);

  let threw = true;
  try {
    fd = fs__default['default'].openSync(tmpfile, 'w', options.mode || 0o666);
    if (options.tmpfileCreated) {
      options.tmpfileCreated(tmpfile);
    }
    if (ArrayBuffer.isView(data)) {
      fs__default['default'].writeSync(fd, data, 0, data.length, 0);
    } else if (data != null) {
      fs__default['default'].writeSync(fd, String(data), 0, String(options.encoding || 'utf8'));
    }
    if (options.fsync !== false) {
      fs__default['default'].fsyncSync(fd);
    }

    fs__default['default'].closeSync(fd);
    fd = null;

    if (options.chown) {
      try {
        fs__default['default'].chownSync(tmpfile, options.chown.uid, options.chown.gid);
      } catch (err) {
        if (!isChownErrOk(err)) {
          throw err;
        }
      }
    }

    if (options.mode) {
      try {
        fs__default['default'].chmodSync(tmpfile, options.mode);
      } catch (err) {
        if (!isChownErrOk(err)) {
          throw err;
        }
      }
    }

    fs__default['default'].renameSync(tmpfile, filename);
    threw = false;
  } finally {
    if (fd) {
      try {
        fs__default['default'].closeSync(fd);
      } catch (ex) {
        // ignore close errors at this stage, error may have closed fd already.
      }
    }
    removeOnExitHandler();
    if (threw) {
      cleanup();
    }
  }
}
lib.sync = sync;
lib._getTmpname = _getTmpname;
lib._cleanupOnExit = _cleanupOnExit;

function applyMigration({ state, migration }) {
  // todo: catch errors -- what to do? drop state for now... !
  const { toVersion, migrator } = migration;

  state.schemaVersion = toVersion;
  migrator(state); // mutates in place

  return state;
}

function migrateState({ state, schemaVersion, schemaMigrations = [] }) {
  let currentState = state;

  while (state.schemaVersion != schemaVersion) {
    const migration = schemaMigrations.find(({ fromVersion }) => fromVersion == state.schemaVersion);

    if (!migration) {
      return; // drop state, no path to migrate further
    }

    try {
      currentState = applyMigration({ state, migration });
    } catch (e) {
      return; // Any problem? Just drop state, YOLO
    }
  }

  return currentState;
}

function dropState({ strState, stateFilePath, noRecovery }) {
  if (!noRecovery && strState?.trim() != '') {
    const extname = path__default['default'].extname(stateFilePath);

    const backupFilePath = stateFilePath.replace(
      new RegExp(`${extname}$`),
      `-recovery-${Date.now()}${extname}`
    );

    fs__default['default'].writeFileSync(backupFilePath, strState);
  }
}

// import rfc6902 from 'rfc6902';
// const generateJsonPatch = rfc6902.createPatch;

// BUMP THIS UP WHEN BREAKING CHANGES TO PROGRAM STATE FORMAT WERE MADE
// EVERYONE WILL GET THEIR STATE RESET WHEN THEY UPDATE AND RESTART THE PROCESS
// JUST THE WAY IT IS, HAPPENS FROM TIME TO TIME but better not!
//

// 💻 → 💾
// we receive clone of the state here, we can mutate it before saving.. no need to clone
function saveState({ stateFilePath, schemaVersion, state, lastSavedState }) {
  // 💡 we record schemaVersion in data if utilizing it in the first place
  if (schemaVersion) {
    state.schemaVersion = schemaVersion;
  }

  if (!lastSavedState || !compare(lastSavedState, state)) {
    // const diff = generateJsonPatch(lastSavedState, state);
    // console.log(JSON.stringify(diff, null, 2));

    lib(stateFilePath, JSON.stringify(state, null, 2), err => {
      // does it really throw so that program stops ?
      if (err) throw err;
    });

    // hopefully it has been written
    return state; // forgot to return this state before and we were exhausting sd cards!! Abu, Iztok and Borovnjakova had problems!!
  }
}

// 💻 ← 💾
function loadState({ stateFilePath, schemaVersion, schemaMigrations = [], noRecovery = false }) {
  if (fs__default['default'].existsSync(stateFilePath)) {
    const strState = fs__default['default'].readFileSync(stateFilePath).toString();

    try {
      const loadedState = JSON.parse(strState);

      if (schemaVersion) {
        if (!loadedState.schemaVersion) {
          return dropState({ strState, stateFilePath, noRecovery }); // drop state
        }

        if (loadedState.schemaVersion != schemaVersion) {
          // either migrates or also drops state if cannot migrate (will return undefined instead of state)
          const migratedState = migrateState({ state: loadedState, schemaVersion, schemaMigrations });

          return migratedState || dropState({ strState, stateFilePath, noRecovery });
        }
      } else if (loadedState.schemaVersion) {
        return dropState({ strState, stateFilePath, noRecovery }); // drop state
      }

      // we land here if:
      // loadedState.schemaVersion and schemaVersion match (same number or they are both undefined)
      return loadedState;
    } catch (e) {
      //log.red('⚠️  Discarding invalid persisted state.');
      return dropState({ strState, stateFilePath, noRecovery }); // drop state
    }
  }
  // state file not present, starting with a clean state ...
}

//const saveState = () => {};
//const loadState = () => {};

// WARNING: initialState can mess with loaded state!
// example:
//
// new SyncStore({ messages: [] })
//
// this won't have the intented consequences because this state will override
// any messages loaded from the file... use carefuly!
//
// initial state is merged into loaded state (2-level merge) and in this case when slot is attay instead of object
// it will set that slot to empty array

// Do this instead:
//
// store.slot('notifications').makeArray().push(data);

class SyncStore extends Eev {
  constructor(
    initialState = {},
    {
      stateFilePath,
      unsavedSlots = [],
      beforeLoadAndSave = state => state,
      schemaVersion,
      schemaMigrations = [],
      noRecovery = false,
      omitStateFn = state => state
    } = {}
  ) {
    super();

    this.stateFilePath = stateFilePath;
    this.unsavedSlots = unsavedSlots;
    this.beforeLoadAndSave = beforeLoadAndSave;
    this.schemaVersion = schemaVersion;
    this.omitStateFn = omitStateFn;

    //this.lastAnnouncedState = clone(initialState); // alternative to below...

    this.slots = {};
    this.kvStore = new KeyValueStore();

    if (this.stateFilePath) {
      const persistedState = loadState({ schemaVersion, stateFilePath, schemaMigrations, noRecovery });

      if (persistedState) {
        this.kvStore.update(removeUnsaved(persistedState, unsavedSlots, beforeLoadAndSave)); // we do remove volatile elements just in case although they shouldn't have been saved in the first place... but sometimes when schema is changing they can be
      }
    }

    this.kvStore.update(initialState);

    this.lastAnnouncedState = this.omitAndCloneState(); // think more about this!

    this.stateChangesCount = 0;

    this.subscriptions = [];
  }

  sync(channelList) {
    this.channelList = channelList;

    channelList.on('new_channel', channel => {
      channel.send({ state: this.lastAnnouncedState });
    });
  }

  sendRemote({ state, diff }) {
    if (this.channelList) {
      this.channelList.sendAll({ state, diff }); // one or the other
    }
  }

  state() {
    return this.kvStore.state;
  }

  // dangerous :)
  // we replace the entire state across all slots
  // set(state) {
  //   this.kvStore.set(state);
  // }

  get(key) {
    return key ? this.state()[key] : this.state();
  }

  omitAndCloneState() {
    return this.omitStateFn(clone(this.state()));
  }

  /* State update functions */

  key(name) {
    return this.slot(name);
  }

  slot(name) {
    if (!this.slots[name]) {
      this.slots[name] = new Slot({ name, parent: this });
    }

    return this.slots[name];
  }

  update(patch, { announce = true, skipDiffing = false } = {}) {
    this.kvStore.update(patch);
    this.announceStateChange(announce, skipDiffing);
  }

  /* end State update functions */

  save() {
    if (this.stateFilePath) {
      const state = removeUnsaved(clone(this.state()), this.unsavedSlots, this.beforeLoadAndSave);
      const savedState = saveState({
        stateFilePath: this.stateFilePath,
        schemaVersion: this.schemaVersion,
        state,
        lastSavedState: this.lastSavedState
      });

      if (savedState) {
        this.lastSavedState = savedState;
      }
    }
  }

  announceStateChange(announce = true, skipDiffing = false) {
    if (!announce) {
      return;
    }

    const remoteState = this.omitAndCloneState();

    if (skipDiffing) {
      this.sendRemote({ state: remoteState });
      this.tagState({ state: remoteState });
      return;
    }

    //const start = stopwatch.start();

    const diff = getDiff(this.lastAnnouncedState, muteAnnounce(this.slots, remoteState));

    //const duration = stopwatch.stop(start);
    //console.log(`Diffing time: ${duration}`);

    if (diff) {
      // console.log(diff);
      //this.emit('diff', diff)
      this.sendRemote({ diff });
      this.stateChangesCount += 1;
      this.tagState({ state: remoteState });
    }
  }

  tagState({ state }) {
    this.save();
    this.lastAnnouncedState = state;
    this.pushStateToLocalSubscribers();
  }

  subscribe(handler) {
    this.subscriptions.push(handler);

    handler(this.state());

    return () => {
      this.subscriptions = this.subscriptions.filter(sub => sub !== handler);
    };
  }

  pushStateToLocalSubscribers() {
    this.subscriptions.forEach(handler => handler(this.state()));
  }
}

exports.SyncStore = SyncStore;
