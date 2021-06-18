export { diffApply, jsonPatchPathConverter };

var REMOVE = 'remove';
var REPLACE = 'replace';
var ADD = 'add';

function diffApply(obj, diff, pathConverter) {
  if (!obj || typeof obj != 'object') {
    throw new Error('base object must be an object or an array');
  }

  if (!Array.isArray(diff)) {
    throw new Error('diff must be an array');
  }

  var diffLength = diff.length;
  for (var i = 0; i < diffLength; i++) {
    var thisDiff = diff[i];
    var subObject = obj;
    var thisOp = thisDiff.op;
    var thisPath = thisDiff.path;
    if (pathConverter) {
      thisPath = pathConverter(thisPath);
      if (!Array.isArray(thisPath)) {
        throw new Error('pathConverter must return an array');
      }
    } else {
      if (!Array.isArray(thisPath)) {
        throw new Error('diff path must be an array, consider supplying a path converter');
      }
    }
    var pathCopy = thisPath.slice();
    var lastProp = pathCopy.pop();
    if (lastProp == null) {
      return false;
    }
    var thisProp;
    while ((thisProp = pathCopy.shift()) != null) {
      if (!(thisProp in subObject)) {
        subObject[thisProp] = {};
      }
      subObject = subObject[thisProp];
    }
    if (thisOp === REMOVE || thisOp === REPLACE) {
      if (!subObject.hasOwnProperty(lastProp)) {
        throw new Error(['expected to find property', thisDiff.path, 'in object', obj].join(' '));
      }
    }
    if (thisOp === REMOVE) {
      Array.isArray(subObject) ? subObject.splice(lastProp, 1) : delete subObject[lastProp];
    }
    if (thisOp === REPLACE || thisOp === ADD) {
      subObject[lastProp] = thisDiff.value;
    }
  }
  return subObject;
}

function jsonPatchPathConverter(stringPath) {
  return stringPath.split('/').slice(1);
}
