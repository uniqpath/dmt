import colors from 'colors';
import stopwatch from './stopwatch';

import colorJson from './colorJson';
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

function measure(func, { desc = ' ', disable = false } = {}) {
  if (disable) {
    return func();
  }

  const start = stopwatch.start();
  const result = func();
  const duration = stopwatch.stop(start);
  const line = colors.gray(`Measured ${colors.cyan(desc)} -`);
  console.log(`${line} ${colors.green(duration)}`);

  return result;
}

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
  measure,
  periodicRepeat,
  autoDetectEOLMarker,
  normalizeMac,
  clone,
  last,
  pad: (number, digits = 2) => {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
  },
  dir(obj) {
    console.log(colorJson(obj));
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
