import colorJSON from './colorJSON';
import deepmerge from './utilities/deepmerge';

import random from './utilities/just/array-random';
import compare from './utilities/just/collection-compare';
import clone from './utilities/just/collection-clone';
import last from './utilities/just/array-last';

import * as hexutils from './utilities/hexutils';
import snakeCaseKeys from './utilities/snakecasekeys';

import { diff } from './utilities/just/collection-diff';

import rfc6902 from 'rfc6902';
const generateJsonPatch = rfc6902.createPatch;

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

function periodicRepeat(callback, timeMs) {
  const update = () => {
    callback();
    setTimeout(update, timeMs);
  };

  update();
}

function autoDetectEOLMarker(content = '') {
  const EOL = content.match(/\r\n/gm) ? '\r\n' : '\n';
  return EOL;
}

function normalizeMac(mac) {
  return mac.toLowerCase().replace(/\b0(\d|[a-f])\b/g, '$1');
}

function randHex(size) {
  const _chars = '0123456789abcdef'.split('');

  size = size && size > 0 ? size : 6;

  let str = '';
  while (size--) {
    const randomElement = _chars[Math.floor(Math.random() * _chars.length)];
    str += randomElement;
  }

  return str;
}

export default {
  compare,
  diff,
  generateJsonPatch,
  deepmerge: (a, b) => {
    return deepmerge(a, b, { arrayMerge: overwriteMerge });
  },
  random,
  hexutils,
  snakeCaseKeys,
  periodicRepeat,
  autoDetectEOLMarker,
  normalizeMac,
  clone,
  last,
  randHex,
  pad: (number, digits = 2) => {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
  },
  dir(obj) {
    console.log(colorJSON(obj));
  },
  round(value, decimals = 2) {
    const factor = 10 ** decimals;
    const res = Math.round(value * factor) / factor;
    return res == -0 ? Math.abs(res) : res;
  },
  epoch: () => {
    return Math.floor(new Date() / 1000);
  },
  unique: items => {
    return [...new Set(items)];
  },
  bestMatch(term, list) {
    list = list.sort((a, b) => a.length - b.length);

    let match = list.find(e => e == term);
    if (match) {
      return match;
    }

    match = list.find(e => e.toLowerCase() == term.toLowerCase());
    if (match) {
      return match;
    }

    match = list.find(e => e.startsWith(term));
    if (match) {
      return match;
    }

    match = list.find(e => e.toLowerCase().startsWith(term.toLowerCase()));
    if (match) {
      return match;
    }

    match = list.find(e => e.indexOf(term) > -1);
    if (match) {
      return match;
    }

    match = list.find(e => e.toLowerCase().indexOf(term.toLowerCase()) > -1);
    if (match) {
      return match;
    }
  },

  listify(obj) {
    if (typeof obj == 'undefined' || obj == null) {
      return [];
    }
    return Array.isArray(obj) ? obj : [obj];
  },

  compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return order === 'desc' ? comparison * -1 : comparison;
    };
  },

  shuffle(array) {
    let counter = array.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);

      counter--;

      const temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  }
};
