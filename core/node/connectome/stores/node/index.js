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
// tried in node.js, had issues:
// DOMException [DataCloneError]: accessor => {
// let current = obj;

// for (const nextKey of accessor.split('.')) {
//   // support square ...<omitted>... } could not be cloned.
// at new DOMException (node:internal/per_context/domexception:53:5)
// at structuredClone (node:internal/structured_clone:23:17)
//
// structuredClone is only supported in v17.9.1 and upwards
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

const defaultIsMergeableObject = isPlainObject;

function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, options) {
  //console.log(`Clone: ${options.clone !== false && options.isMergeableObject(value)}`);
  //console.log(`isMergeableObject: ${options.isMergeableObject(value)}`);
  return options.clone !== false && options.isMergeableObject(value)
    ? deepmerge(emptyTarget(value), value, options)
    : value;
}

function defaultArrayMerge(target, source, options) {
  return target.concat(source).map(function (element) {
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
    Object.keys(target).forEach(function (key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  Object.keys(source).forEach(function (key) {
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
  options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;

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

  return array.reduce(function (prev, next) {
    return deepmerge(prev, next, options);
  }, {});
};

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

/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017 Joachim Wester
 * MIT license
 */
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        var keys = new Array(obj.length);
        for (var k = 0; k < keys.length; k++) {
            keys[k] = "" + k;
        }
        return keys;
    }
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var i in obj) {
        if (hasOwnProperty(obj, i)) {
            keys.push(i);
        }
    }
    return keys;
}
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/
function _deepClone(obj) {
    switch (typeof obj) {
        case "object":
            return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
        case "undefined":
            return null; //this is how JSON.stringify behaves for array items
        default:
            return obj; //no need to clone primitives
    }
}
//3x faster than cached /^\d+$/.test(str)
function isInteger(str) {
    var i = 0;
    var len = str.length;
    var charCode;
    while (i < len) {
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
/**
* Escapes a json pointer path
* @param path The raw pointer
* @return the Escaped path
*/
function escapePathComponent(path) {
    if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
        return path;
    return path.replace(/~/g, '~0').replace(/\//g, '~1');
}
/**
 * Unescapes a json pointer path
 * @param path The escaped pointer
 * @return The unescaped path
 */
function unescapePathComponent(path) {
    return path.replace(/~1/g, '/').replace(/~0/g, '~');
}
/**
* Recursively checks whether an object has any undefined values inside.
*/
function hasUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    if (obj) {
        if (Array.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                if (hasUndefined(obj[i])) {
                    return true;
                }
            }
        }
        else if (typeof obj === "object") {
            var objKeys = _objectKeys(obj);
            var objKeysLength = objKeys.length;
            for (var i = 0; i < objKeysLength; i++) {
                if (hasUndefined(obj[objKeys[i]])) {
                    return true;
                }
            }
        }
    }
    return false;
}
function patchErrorMessageFormatter(message, args) {
    var messageParts = [message];
    for (var key in args) {
        var value = typeof args[key] === 'object' ? JSON.stringify(args[key], null, 2) : args[key]; // pretty print
        if (typeof value !== 'undefined') {
            messageParts.push(key + ": " + value);
        }
    }
    return messageParts.join('\n');
}
var PatchError = /** @class */ (function (_super) {
    __extends(PatchError, _super);
    function PatchError(message, name, index, operation, tree) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree })) || this;
        _this.name = name;
        _this.index = index;
        _this.operation = operation;
        _this.tree = tree;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain, see https://stackoverflow.com/a/48342359
        _this.message = patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree });
        return _this;
    }
    return PatchError;
}(Error));

var JsonPatchError = PatchError;
var deepClone = _deepClone;
/* We use a Javascript hash to store each
 function. Each hash entry (property) uses
 the operation identifiers specified in rfc6902.
 In this way, we can map each patch operation
 to its dedicated function in efficient way.
 */
/* The operations applicable to an object */
var objOps = {
    add: function (obj, key, document) {
        obj[key] = this.value;
        return { newDocument: document };
    },
    remove: function (obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document, removed: removed };
    },
    replace: function (obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: function (obj, key, document) {
        /* in case move target overwrites an existing value,
        return the removed value, this can be taxing performance-wise,
        and is potentially unneeded */
        var removed = getValueByPointer(document, this.path);
        if (removed) {
            removed = _deepClone(removed);
        }
        var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
        applyOperation(document, { op: "add", path: this.path, value: originalValue });
        return { newDocument: document, removed: removed };
    },
    copy: function (obj, key, document) {
        var valueToCopy = getValueByPointer(document, this.from);
        // enforce copy by value so further operations don't affect source (see issue #177)
        applyOperation(document, { op: "add", path: this.path, value: _deepClone(valueToCopy) });
        return { newDocument: document };
    },
    test: function (obj, key, document) {
        return { newDocument: document, test: _areEquals(obj[key], this.value) };
    },
    _get: function (obj, key, document) {
        this.value = obj[key];
        return { newDocument: document };
    }
};
/* The operations applicable to an array. Many are the same as for the object */
var arrOps = {
    add: function (arr, i, document) {
        if (isInteger(i)) {
            arr.splice(i, 0, this.value);
        }
        else { // array props
            arr[i] = this.value;
        }
        // this may be needed when using '-' in an array
        return { newDocument: document, index: i };
    },
    remove: function (arr, i, document) {
        var removedList = arr.splice(i, 1);
        return { newDocument: document, removed: removedList[0] };
    },
    replace: function (arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
 * Retrieves a value from a JSON document by a JSON pointer.
 * Returns the value.
 *
 * @param document The document to get the value from
 * @param pointer an escaped JSON pointer
 * @return The retrieved value
 */
function getValueByPointer(document, pointer) {
    if (pointer == '') {
        return document;
    }
    var getOriginalDestination = { op: "_get", path: pointer };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the {newDocument, result} of the operation.
 * It modifies the `document` and `operation` objects - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
 * @return `{newDocument, result}` after the operation
 */
function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
    if (validateOperation === void 0) { validateOperation = false; }
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
    if (index === void 0) { index = 0; }
    if (validateOperation) {
        if (typeof validateOperation == 'function') {
            validateOperation(operation, 0, document, operation.path);
        }
        else {
            validator(operation, 0);
        }
    }
    /* ROOT OPERATIONS */
    if (operation.path === "") {
        var returnValue = { newDocument: document };
        if (operation.op === 'add') {
            returnValue.newDocument = operation.value;
            return returnValue;
        }
        else if (operation.op === 'replace') {
            returnValue.newDocument = operation.value;
            returnValue.removed = document; //document we removed
            return returnValue;
        }
        else if (operation.op === 'move' || operation.op === 'copy') { // it's a move or copy to root
            returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
            if (operation.op === 'move') { // report removed item
                returnValue.removed = document;
            }
            return returnValue;
        }
        else if (operation.op === 'test') {
            returnValue.test = _areEquals(document, operation.value);
            if (returnValue.test === false) {
                throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
            }
            returnValue.newDocument = document;
            return returnValue;
        }
        else if (operation.op === 'remove') { // a remove on root
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        }
        else if (operation.op === '_get') {
            operation.value = document;
            return returnValue;
        }
        else { /* bad operation */
            if (validateOperation) {
                throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
            }
            else {
                return returnValue;
            }
        }
    } /* END ROOT OPERATIONS */
    else {
        if (!mutateDocument) {
            document = _deepClone(document);
        }
        var path = operation.path || "";
        var keys = path.split('/');
        var obj = document;
        var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
        var len = keys.length;
        var existingPathFragment = undefined;
        var key = void 0;
        var validateFunction = void 0;
        if (typeof validateOperation == 'function') {
            validateFunction = validateOperation;
        }
        else {
            validateFunction = validator;
        }
        while (true) {
            key = keys[t];
            if (banPrototypeModifications && key == '__proto__') {
                throw new TypeError('JSON-Patch: modifying `__proto__` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README');
            }
            if (validateOperation) {
                if (existingPathFragment === undefined) {
                    if (obj[key] === undefined) {
                        existingPathFragment = keys.slice(0, t).join('/');
                    }
                    else if (t == len - 1) {
                        existingPathFragment = operation.path;
                    }
                    if (existingPathFragment !== undefined) {
                        validateFunction(operation, 0, document, existingPathFragment);
                    }
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === '-') {
                    key = obj.length;
                }
                else {
                    if (validateOperation && !isInteger(key)) {
                        throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                    } // only parse key when it's an integer for `arr.prop` to work
                    else if (isInteger(key)) {
                        key = ~~key;
                    }
                }
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) {
                        throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                    }
                    var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                    }
                    return returnValue;
                }
            }
            else {
                if (key && key.indexOf('~') != -1) {
                    key = unescapePathComponent(key);
                }
                if (t >= len) {
                    var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                    }
                    return returnValue;
                }
            }
            obj = obj[key];
        }
    }
}
/**
 * Apply a full JSON Patch array on a JSON document.
 * Returns the {newDocument, result} of the patch.
 * It modifies the `document` object and `patch` - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
 *
 * @param document The document to patch
 * @param patch The patch to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
 * @return An array of `{newDocument, result}` after the patch
 */
function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
    if (validateOperation) {
        if (!Array.isArray(patch)) {
            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
    }
    if (!mutateDocument) {
        document = _deepClone(document);
    }
    var results = new Array(patch.length);
    for (var i = 0, length_1 = patch.length; i < length_1; i++) {
        // we don't need to pass mutateDocument argument because if it was true, we already deep cloned the object, we'll just pass `true`
        results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
        document = results[i].newDocument; // in case root was replaced
    }
    results.newDocument = document;
    return results;
}
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the updated document.
 * Suitable as a reducer.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @return The updated document
 */
function applyReducer(document, operation, index) {
    var operationResult = applyOperation(document, operation);
    if (operationResult.test === false) { // failed test
        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
    }
    return operationResult.newDocument;
}
/**
 * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
 * @param {object} operation - operation object (patch)
 * @param {number} index - index of operation in the sequence
 * @param {object} [document] - object where the operation is supposed to be applied
 * @param {string} [existingPathFragment] - comes along with `document`
 */
function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
        throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
    }
    else if (!objOps[operation.op]) {
        throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
    }
    else if (typeof operation.path !== 'string') {
        throw new JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
        // paths that aren't empty string should start with "/"
        throw new JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
        throw new JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && hasUndefined(operation.value)) {
        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
    }
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                throw new JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
            }
        }
        else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
            if (operation.path !== existingPathFragment) {
                throw new JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
            }
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            var existingValue = { op: "_get", path: operation.from, value: undefined };
            var error = validate([existingValue], document);
            if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                throw new JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
            }
        }
    }
}
/**
 * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
 * If error is encountered, returns a JsonPatchError object
 * @param sequence
 * @param document
 * @returns {JsonPatchError|undefined}
 */
function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) {
            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
        if (document) {
            //clone document and sequence so that we can safely try applying operations
            applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
        }
        else {
            externalValidator = externalValidator || validator;
            for (var i = 0; i < sequence.length; i++) {
                externalValidator(sequence[i], i, document, undefined);
            }
        }
    }
    catch (e) {
        if (e instanceof JsonPatchError) {
            return e;
        }
        else {
            throw e;
        }
    }
}
// based on https://github.com/epoberezkin/fast-deep-equal
// MIT License
// Copyright (c) 2017 Evgeny Poberezkin
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
function _areEquals(a, b) {
    if (a === b)
        return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
        if (arrA && arrB) {
            length = a.length;
            if (length != b.length)
                return false;
            for (i = length; i-- !== 0;)
                if (!_areEquals(a[i], b[i]))
                    return false;
            return true;
        }
        if (arrA != arrB)
            return false;
        var keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length)
            return false;
        for (i = length; i-- !== 0;)
            if (!b.hasOwnProperty(keys[i]))
                return false;
        for (i = length; i-- !== 0;) {
            key = keys[i];
            if (!_areEquals(a[key], b[key]))
                return false;
        }
        return true;
    }
    return a !== a && b !== b;
}

var core = /*#__PURE__*/Object.freeze({
  __proto__: null,
  JsonPatchError: JsonPatchError,
  deepClone: deepClone,
  getValueByPointer: getValueByPointer,
  applyOperation: applyOperation,
  applyPatch: applyPatch,
  applyReducer: applyReducer,
  validator: validator,
  validate: validate,
  _areEquals: _areEquals
});

/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017 Joachim Wester
 * MIT license
 */
var beforeDict = new WeakMap();
var Mirror = /** @class */ (function () {
    function Mirror(obj) {
        this.observers = new Map();
        this.obj = obj;
    }
    return Mirror;
}());
var ObserverInfo = /** @class */ (function () {
    function ObserverInfo(callback, observer) {
        this.callback = callback;
        this.observer = observer;
    }
    return ObserverInfo;
}());
function getMirror(obj) {
    return beforeDict.get(obj);
}
function getObserverFromMirror(mirror, callback) {
    return mirror.observers.get(callback);
}
function removeObserverFromMirror(mirror, observer) {
    mirror.observers.delete(observer.callback);
}
/**
 * Detach an observer from an object
 */
function unobserve(root, observer) {
    observer.unobserve();
}
/**
 * Observes changes made to an object, which can then be retrieved using generate
 */
function observe(obj, callback) {
    var patches = [];
    var observer;
    var mirror = getMirror(obj);
    if (!mirror) {
        mirror = new Mirror(obj);
        beforeDict.set(obj, mirror);
    }
    else {
        var observerInfo = getObserverFromMirror(mirror, callback);
        observer = observerInfo && observerInfo.observer;
    }
    if (observer) {
        return observer;
    }
    observer = {};
    mirror.value = _deepClone(obj);
    if (callback) {
        observer.callback = callback;
        observer.next = null;
        var dirtyCheck = function () {
            generate(observer);
        };
        var fastCheck = function () {
            clearTimeout(observer.next);
            observer.next = setTimeout(dirtyCheck);
        };
        if (typeof window !== 'undefined') { //not Node
            window.addEventListener('mouseup', fastCheck);
            window.addEventListener('keyup', fastCheck);
            window.addEventListener('mousedown', fastCheck);
            window.addEventListener('keydown', fastCheck);
            window.addEventListener('change', fastCheck);
        }
    }
    observer.patches = patches;
    observer.object = obj;
    observer.unobserve = function () {
        generate(observer);
        clearTimeout(observer.next);
        removeObserverFromMirror(mirror, observer);
        if (typeof window !== 'undefined') {
            window.removeEventListener('mouseup', fastCheck);
            window.removeEventListener('keyup', fastCheck);
            window.removeEventListener('mousedown', fastCheck);
            window.removeEventListener('keydown', fastCheck);
            window.removeEventListener('change', fastCheck);
        }
    };
    mirror.observers.set(callback, new ObserverInfo(callback, observer));
    return observer;
}
/**
 * Generate an array of patches from an observer
 */
function generate(observer, invertible) {
    if (invertible === void 0) { invertible = false; }
    var mirror = beforeDict.get(observer.object);
    _generate(mirror.value, observer.object, observer.patches, "", invertible);
    if (observer.patches.length) {
        applyPatch(mirror.value, observer.patches);
    }
    var temp = observer.patches;
    if (temp.length > 0) {
        observer.patches = [];
        if (observer.callback) {
            observer.callback(temp);
        }
    }
    return temp;
}
// Dirty check if obj is different from mirror, generate patches and update mirror
function _generate(mirror, obj, patches, path, invertible) {
    if (obj === mirror) {
        return;
    }
    if (typeof obj.toJSON === "function") {
        obj = obj.toJSON();
    }
    var newKeys = _objectKeys(obj);
    var oldKeys = _objectKeys(mirror);
    var deleted = false;
    //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
    for (var t = oldKeys.length - 1; t >= 0; t--) {
        var key = oldKeys[t];
        var oldVal = mirror[key];
        if (hasOwnProperty(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
            var newVal = obj[key];
            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                _generate(oldVal, newVal, patches, path + "/" + escapePathComponent(key), invertible);
            }
            else {
                if (oldVal !== newVal) {
                    if (invertible) {
                        patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
                    }
                    patches.push({ op: "replace", path: path + "/" + escapePathComponent(key), value: _deepClone(newVal) });
                }
            }
        }
        else if (Array.isArray(mirror) === Array.isArray(obj)) {
            if (invertible) {
                patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
            }
            patches.push({ op: "remove", path: path + "/" + escapePathComponent(key) });
            deleted = true; // property has been deleted
        }
        else {
            if (invertible) {
                patches.push({ op: "test", path: path, value: mirror });
            }
            patches.push({ op: "replace", path: path, value: obj });
        }
    }
    if (!deleted && newKeys.length == oldKeys.length) {
        return;
    }
    for (var t = 0; t < newKeys.length; t++) {
        var key = newKeys[t];
        if (!hasOwnProperty(mirror, key) && obj[key] !== undefined) {
            patches.push({ op: "add", path: path + "/" + escapePathComponent(key), value: _deepClone(obj[key]) });
        }
    }
}
/**
 * Create an array of patches from the differences in two objects
 */
function compare(tree1, tree2, invertible) {
    if (invertible === void 0) { invertible = false; }
    var patches = [];
    _generate(tree1, tree2, patches, '', invertible);
    return patches;
}

var duplex = /*#__PURE__*/Object.freeze({
  __proto__: null,
  unobserve: unobserve,
  observe: observe,
  generate: generate,
  compare: compare
});

var fastJsonPatch = Object.assign({}, core, duplex, {
    JsonPatchError: PatchError,
    deepClone: _deepClone,
    escapePathComponent,
    unescapePathComponent
});

// import rfc6902 from 'rfc6902';
const { compare: compare$1 } = fastJsonPatch;

function getDiff(prevAnnouncedState, currentState) {
  const diff = compare$1(prevAnnouncedState, currentState);

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

var commonjsGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {};

function createCommonjsModule(fn, basedir, module) {
  return (
    (module = {
      path: basedir,
      exports: {},
      require: function (path, base) {
        return commonjsRequire(path, base === undefined || base === null ? module.path : base);
      }
    }),
    fn(module, module.exports),
    module.exports
  );
}

function commonjsRequire() {
  throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var imurmurhash = createCommonjsModule(function (module) {
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

var signals = createCommonjsModule(function (module) {
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

var signalExit = createCommonjsModule(function (module) {
  // Note: since nyc uses this module to output coverage, any lines
  // that are in the direct sync flow of nyc's outputCoverage are
  // ignored, since we can never get coverage for them.
  // grab a reference to node's real process object right away
  var process = commonjsGlobal.process;

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
      if (!processOk(commonjsGlobal.process)) {
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
      if (!loaded || !processOk(commonjsGlobal.process)) {
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
        if (!processOk(commonjsGlobal.process)) {
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
      if (loaded || !processOk(commonjsGlobal.process)) {
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
      if (!processOk(commonjsGlobal.process)) {
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
      if (ev === 'exit' && processOk(commonjsGlobal.process)) {
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

// return true if objects are the same
// previously used just collection-compare, but this is faster !
function compare$2(a, b) {
  return fastJsonPatch.compare(a, b).length == 0;
}

//import { stopwatchAdv } from '../utils/index.js';

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

  if (!lastSavedState || !compare$2(lastSavedState, state)) {
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
      omitStateFn = state => state,
      log
    } = {}
  ) {
    super();

    this.stateFilePath = stateFilePath;
    this.unsavedSlots = unsavedSlots;
    this.beforeLoadAndSave = beforeLoadAndSave;
    this.schemaVersion = schemaVersion;
    this.omitStateFn = omitStateFn;
    this._log = log;

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

  log(...args) {
    if (this._log) {
      this._log.write(...args);
    }
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
      this.log('removeUnsaved(clone(this.state()), this.unsavedSlots, this.beforeLoadAndSave)');
      const savedState = saveState({
        stateFilePath: this.stateFilePath,
        schemaVersion: this.schemaVersion,
        state,
        lastSavedState: this.lastSavedState
      });

      if (savedState) {
        this.log('state did save');
        this.lastSavedState = savedState;
      } else {
        this.log('state did not save');
      }
    }
  }

  // skiDiffing -- not in use currently since we made diffing fast in all cases
  //announceStateChange(announce = true, skipDiffing = false) {
  announceStateChange(announce = true) {
    if (!announce) {
      return;
    }

    this.log('--- announceStateChange ---');

    const remoteState = this.omitAndCloneState();

    // if (skipDiffing) {
    //   this.sendRemote({ state: remoteState });
    //   this.tagState({ state: remoteState });
    //   return;
    // }

    // const start = stopwatchAdv.start();

    this.log('after clone');

    const diff = getDiff(this.lastAnnouncedState, muteAnnounce(this.slots, remoteState));

    this.log('after diff clone');

    // const { duration, prettyTime } = stopwatchAdv.stop(start);

    // // report diffs that are more than 2ms
    // if (duration / 1e6 > 2) {
    //   console.log(`Diffing time: ${prettyTime}`);
    // }

    if (diff) {
      // console.log(diff);
      // console.log(`Diff size: ${diff.length}`);
      // console.log();

      //this.emit('diff', diff)
      this.sendRemote({ diff });
      this.log('after send remote');
      this.stateChangesCount += 1;
      this.tagState({ state: remoteState });
      this.log('after tag state');
    }
  }

  tagState({ state }) {
    this.save();
    this.log('after save');
    this.lastAnnouncedState = state;
    this.pushStateToLocalSubscribers();
    this.log('after pushStateToLocalSubscribers');
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
