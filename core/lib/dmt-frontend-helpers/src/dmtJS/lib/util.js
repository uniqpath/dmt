import def from './def';
import css from './cssBridge';

function log(msg) {
  console.log(`${new Date().toLocaleString()} → ${msg}`);
}

function isInputElementActive() {
  const { activeElement } = document;
  const inputs = ['input', 'select', 'textarea'];

  if (activeElement && inputs.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
    return true;
  }
}

log.write = log;

function dir(msg) {
  console.log(`${new Date().toLocaleString()} → ${JSON.stringify(msg, null, 2)}`);
}

function pad(number, digits = 2) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function getDisplayTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function unique(items) {
  return [...new Set(items)];
}

function setWallpaper(wallpaper) {
  if (wallpaper) {
    css.setWallpaper(wallpaper);
  } else {
    css.setWallpaper('');
  }
}

function compareValues(key, order = 'asc') {
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
}

function accessProperty(obj, acc) {
  return def.tryOnTheFly(obj, acc);
}

function msIntoTimeSpan(timeInMs, index = 0, result = {}) {
  const times = ['day', 'h', 'min', 's'];
  const arr = [24, 60, 60, 1000];

  if (index == times.length) {
    result['ms'] = timeInMs;
    return result;
  }

  if (index == 0) {
    result.totalSeconds = timeInMs / 1000.0;
  }

  const n = arr.slice(index).reduce((total, num) => total * num, 1);
  result[times[index]] = Math.floor(timeInMs / n);

  return msIntoTimeSpan(timeInMs % n, index + 1, result);
}

function humanTime(ts) {
  const times = ['day', 'h', 'min', 's'];
  let str = '';

  for (const t of times) {
    if (ts[t] > 0) {
      if (t != 's' || (t == 's' && ts.totalSeconds < 60)) {
        str = `${str} ${ts[t]} ${t}`;
      }
    }
  }

  return str.trim();
}

function songTime(s) {
  s = Math.round(s);
  const hours = Math.floor(s / 3600);
  const rem = s % 3600;
  const min = Math.floor(rem / 60);
  s = rem % 60;

  return hours ? `${hours}h ${pad(min)}min ${pad(s)}s` : `${min}:${pad(s)}`;
}

function colorJSON(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
    var cls = 'number';
    var color = 'yellow';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
        color = 'cyan';
      } else {
        cls = 'string';
        color = '#66F62A';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
      color = 'orange';
    } else if (/null/.test(match)) {
      cls = 'null';
      color = 'red';
    }
    return `<span style="color: ${color}" class="${cls}">${match}</span>`;
  });
}

function Utf8ArrayToStr(array) {
  let out;
  let i;
  let c;
  let char2;
  let char3;

  out = '';

  const len = array.length;

  i = 0;

  while (i < len) {
    c = array[i++];

    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
        break;
      default:
        break;
    }
  }

  return out;
}

function listify(obj) {
  if (typeof obj == 'undefined' || obj == null) {
    return [];
  }
  return Array.isArray(obj) ? obj : [obj];
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const tokens = hex.match(/.{1,2}(?=(.{2})+(?!.))|.{1,2}$/g);
  return new Uint8Array(tokens.map(token => parseInt(token, 16)));
}

function getAllFuncs(obj) {
  return Object.getOwnPropertyNames(obj.prototype).filter(prop => prop != 'constructor' && typeof obj.prototype[prop] == 'function');
}

function includeModule(obj, Module) {
  const module = new Module();

  for (const func of getAllFuncs(Module)) {
    obj[func] = module[func];
  }
}

export default {
  log,
  dir,
  pad,
  getDisplayTime,
  unique,
  setWallpaper,
  compareValues,
  msIntoTimeSpan,
  humanTime,
  songTime,
  colorJSON,
  Utf8ArrayToStr,
  isInputElementActive,
  listify,
  bufferToHex,
  hexToBuffer,
  includeModule
};
