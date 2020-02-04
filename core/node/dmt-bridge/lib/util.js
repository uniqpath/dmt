const colors = require('colors');
const moment = require('moment');

const stopwatch = require('./stopwatch');

const colorJson = require('./colorJson');
const deepmerge = require('./utilities/deepmerge');
const random = require('./utilities/just/array-random');
const hexutils = require('./utilities/hexutils');
const snakeCaseKeys = require('./utilities/snakecasekeys');

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

const generateJsonPatch = require('rfc6902').createPatch;

const { diff, jsonPatchPathConverter } = require('./utilities/just/collection-diff');
function nodeVersion() {
  const re = new RegExp(/^v(.*?)\.(.*?)\./);
  const matches = re.exec(process.version);
  if (matches) {
    return {
      major: parseInt(matches[1]),
      minor: parseInt(matches[2])
    };
  }
}

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

module.exports = {
  compare: require('./utilities/just/collection-compare'),
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
  clone: require('./utilities/just/collection-clone'),
  last: require('./utilities/just/array-last'),
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
  relativeTimeSince(timestamp) {
    if (timestamp) {
      const idleTime = Date.now() - timestamp;
      const n = 24 * 60 * 60 * 1000;
      const days = Math.floor(idleTime / n);
      const str = moment.utc(idleTime % n).format('H [h] mm [min]');
      return `${days > 0 ? `${days} ${days == 1 ? 'day' : 'days'} ` : ''}${str}`;
    }
  },
  flatten: arr => {
    if (!Array.isArray(arr)) {
      return arr;
    }

    const { major, minor } = nodeVersion();

    if (major > 11 || (major == 11 && minor >= 4)) {
      return arr.flat();
    }

    const flatten = require('./utilities/just/array-flatten');
    return flatten(arr);
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
