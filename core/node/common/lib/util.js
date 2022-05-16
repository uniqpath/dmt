import colorJSON from './colorJSON';
import fs from 'fs';
import random from './utilities/just/array-random';
import compare from './utilities/just/collection-compare';
import clone from './utilities/just/collection-clone';
import last from './utilities/just/array-last';

import * as hexutils from './utilities/hexutils';
import snakeCaseKeys from './utilities/snakecasekeys';

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

function replaceAll(str, a, b) {
  return str.replace(new RegExp(a, 'g'), b);
}

function trim(str, ch) {
  let start = 0;
  let end = str.length;

  while (start < end && str[start] === ch) ++start;

  while (end > start && str[end - 1] === ch) --end;

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

function trimAny(str, chars) {
  let start = 0;
  let end = str.length;

  while (start < end && chars.indexOf(str[start]) >= 0) ++start;

  while (end > start && chars.indexOf(str[end - 1]) >= 0) --end;

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

const LETTER_MAP = {
  Æ: 'AE',
  æ: 'ae',

  Ø: 'O',
  ø: 'o',

  ß: 'ss',

  Đ: 'D',
  đ: 'd',

  ł: 'l',
  Ł: 'L',

  Œ: 'OE',
  œ: 'oe'
};

function normalizeStr(str) {
  let a = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [letter, replacement] of Object.entries(LETTER_MAP)) {
    a = replaceAll(a, letter, replacement);
  }

  return a;
}

function normalizeUrl(url) {
  function removeTrailingSlashes(url) {
    return url.replace(/\/+$/, '');
  }
  return removeTrailingSlashes(url);
}

function limitString(string = '', limit = 0) {
  return string.length > limit ? `${string.substring(0, limit)}…` : string;
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

function mkdirp(dir) {
  fs.mkdirSync(dir, { mode: 0o755, recursive: true });
}

export default {
  compare,
  random,
  mkdirp,
  hexutils,
  replaceAll,
  trim,
  trimAny,
  normalizeStr,
  normalizeUrl,
  limitString,
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

  orderBy(key, key2, order = 'asc') {
    function _comparison(a, b, key) {
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
    }

    return function innerSort(a, b) {
      let comparison = _comparison(a, b, key);

      if (comparison == 0 && key2) {
        comparison = _comparison(a, b, key2);
      }

      return comparison;
    };
  },

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
};
