import path from 'path';
import fs from 'fs';
import inlineValueParser from './inlineValueParser';

import _defjson from 'dmt-defjson';
const { json2def: fromJson } = _defjson;

import colors from '../../colors/colors';

const cache = {};
const basicParsingCache = {};

function parse(str) {
  return parseString(str);
}

function parseFile(filePath, { caching = true, onlyBasicParsing = false } = {}) {
  const cachedResult = onlyBasicParsing ? basicParsingCache[filePath] : cache[filePath];

  if (caching && cachedResult) {
    return finalResult(JSON.parse(JSON.stringify(cachedResult)), { onlyBasicParsing });
  }

  const result = parseFileActual(filePath, { onlyBasicParsing });

  if (result.empty) {
    return makeTryable(result);
  }

  if (caching) {
    if (onlyBasicParsing) {
      basicParsingCache[filePath] = result;
    } else {
      cache[filePath] = result;
    }
  }

  return finalResult(JSON.parse(JSON.stringify(result)), { onlyBasicParsing });
}

function finalResult(result, { onlyBasicParsing }) {
  const rootKey = Object.keys(result)[0];

  const finalResult = {};
  finalResult.multi = result[rootKey];
  finalResult[rootKey] = makeTryable(JSON.parse(JSON.stringify(result[rootKey][0])));

  if (onlyBasicParsing) {
    return makeTryable(finalResult);
  }

  finalResult.multi.forEach(result => {
    if (result.id) {
      finalResult[result.id] = result;
    }
  });

  return makeTryable(finalResult);
}

function parseFileActual(filePath, { onlyBasicParsing = false } = {}) {
  const empty = { multi: [], empty: true };

  if (!fs.existsSync(filePath)) {
    throw new Error(`Def parser error: cannot read file ${colors.cyan(filePath)}`);
  }

  const contents = fs.readFileSync(filePath).toString();

  if (
    getUsableLines(contents)
      .join('')
      .trim() == ''
  ) {
    return empty;
  }

  const result = parseString(fs.readFileSync(filePath).toString(), { cwd: path.dirname(filePath), onlyBasicParsing, filePathInfo: filePath });

  const rootKey = Object.keys(result)[0];
  if (!rootKey) {
    throw new Error(`Root key missing for ${filePath}`);
  }

  return result;
}

function checkIfIdAlreadyPresentInList(prop, list, _id) {
  if (list.map(el => id(el)).includes(_id)) {
    throw new Error(`an element of key=${prop} with id=${_id} already exists, please make sure all ids for key=${prop} are unique`);
  }
}

function getUsableLines(str) {
  const magicToken = '%-%-%-MAGIC_STR_8765432-%-%-%';

  return str
    .replace(/\\#/g, magicToken)
    .split('\r')
    .join('')
    .split('\n')
    .map(line => (line.includes('#') ? line.split('#')[0] : line))
    .filter(line => line.trim() != '' && line.trim() != '---')
    .map(line => line.replace(new RegExp(magicToken, 'g'), '#'));
}

function parseString(str, { cwd, onlyBasicParsing = false, filePathInfo } = {}) {
  const lines = getUsableLines(str);

  if (lines.length == 0) {
    return {};
  }

  const json = parseTopLevelList(lines, { cwd, onlyBasicParsing, filePathInfo });

  if (Object.keys(json).length != 1) {
    throw new Error(`Top level entry count has to contain one key, currently has: ${Object.keys(json)}`);
  }

  return json;
}

function constructTryer(obj) {
  return accessor => {
    let current = obj;

    for (const nextKey of accessor.split('.')) {
      const re = new RegExp(/(\S*)\[['"]?(\S*?)['"]?\]/);
      const matches = nextKey.match(re);
      if (matches) {
        const nextDict = matches[1];
        const _nextKey = matches[2];
        current = listify(current[nextDict]).find(el => id(el) == _nextKey);
      } else {
        current = current[nextKey];
      }

      if (typeof current == 'undefined') {
        return undefined;
      }
    }

    return current;
  };
}

function tryOnTheFly(obj, accessor) {
  return constructTryer(obj)(accessor);
}

function makeTryable(obj) {
  if (!obj) {
    obj = {};
  }

  obj.try = constructTryer(obj);

  return obj;
}

function listify(obj) {
  if (typeof obj == 'undefined' || obj == null) {
    return [];
  }
  if (Array.isArray(obj)) {
    return obj;
  }
  if (typeof obj == 'string') {
    return [{ id: obj }];
  }
  return [obj];
}

function id(obj) {
  return values(obj)[0];
}

function values(obj) {
  return listify(obj).map(el => el.id);
}

function split(str, sep = ':') {
  const parts = str.split(sep);
  const a = parts.shift().trim();
  const b = parts.join(sep).trim();
  return [a, b];
}

function throwError(line, filePathInfo, msg) {
  throw new Error(
    colors.white(`${colors.red('Problem parsing def file')} ${colors.cyan(filePathInfo)} → ${colors.yellow(msg)} (offending line is '${colors.gray(line)}')`)
  );
}

function validateKey(keyName, line, { filePathInfo }) {
  if (keyName == 'id') {
    const msg = "illegal key name 'id' which is a reserved word";
    throwError(line, filePathInfo, msg);
  }
}

function parseDict(lines, options = {}) {
  let buildup = [];

  let prevIndent = -1;

  const header = lines[0];
  const [key, value] = split(header);

  validateKey(key, header, options);

  const data = value ? { id: value } : {};

  let prevLine;
  lines.push('');

  for (const line of lines.slice(1).map(line => line.replace(/^\s\s/, ''))) {
    const indent = line.search(/\S|$/) / 2;

    if (indent == 1 && prevIndent == 0) {
      buildup = [prevLine];
    } else if (buildup.length > 0) {
      buildup.push(prevLine);

      if (indent == 0) {
        const header = buildup[0];
        const [headerKey, headerValue] = split(header);

        validateKey(headerKey, header, options);

        if (Array.isArray(data[headerKey])) {
          data[headerKey].push(parseDict(buildup, options));
        } else if (data[headerKey]) {
          data[headerKey] = [data[headerKey], parseDict(buildup, options)];
        } else {
          data[headerKey] = parseDict(buildup, options);
        }

        buildup = [];
      }
    } else if (prevLine) {
      const [prevKey, prevValue] = split(prevLine);

      validateKey(prevKey, prevLine, options);
      if (Array.isArray(data[prevKey])) {
        data[prevKey].push(convertSimpleValueToHashInsideAnArray(parseSimpleValue(prevValue, options)));
      } else if (data[prevKey]) {
        data[prevKey] = [convertSimpleValueToHashInsideAnArray(data[prevKey]), convertSimpleValueToHashInsideAnArray(parseSimpleValue(prevValue, options))];
      } else {
        data[prevKey] = parseSimpleValue(prevValue, options);
      }
    }

    prevIndent = indent;
    prevLine = line;
  }

  return data;
}

function convertSimpleValueToHashInsideAnArray(val) {
  return typeof val == 'string'
    ? {
        id: val
      }
    : val;
}

function parseSimpleValue(str, { cwd, onlyBasicParsing }) {
  if (onlyBasicParsing) {
    return str;
  }

  return inlineValueParser(str, { cwd, parseFile });
}

function checkSpacing(lines, { filePathInfo }) {
  let prevLeadSpaces;
  for (const line of lines) {
    const leadSpaces = line.search(/\S/);
    if (prevLeadSpaces != null) {
      const diff = leadSpaces - prevLeadSpaces;

      let fail;

      if (diff % 2 != 0) {
        fail = true;
      }

      if (diff >= 0 && diff != 0 && diff != 2) {
        fail = true;
      }

      if (fail) {
        throwError(line, filePathInfo, 'wrong number of lead spaces');
      }
    }
    prevLeadSpaces = leadSpaces;
  }
}

function parseTopLevelList(lines, { cwd, onlyBasicParsing, filePathInfo }) {
  checkSpacing(lines, { filePathInfo });

  const data = [];
  let buildup = [];

  let prevIndent = -1;

  let rootKey;

  lines.push('');

  for (const line of lines) {
    if (line != '' && line.indexOf(':') == -1) {
      throwError(line, filePathInfo, 'every line has to contain a colon (":") and this line does not');
    }

    const indent = line.search(/\S|$/) / 2;

    if (line != '' && indent == 0) {
      const mainKey = line.split(':')[0].trim();
      if (!rootKey) {
        rootKey = mainKey;
      } else if (rootKey != mainKey) {
        const msg = `Root key has to be unique with one or more occurences.\nFound outlier root key "${colors.cyan(
          mainKey
        )}" which differs from previously seen root key "${colors.cyan(rootKey)}"`;

        throwError(line, filePathInfo, msg);
      }
    }

    if (indent == 0 && (prevIndent > 0 || buildup.length > 0)) {
      data.push(parseDict(buildup, { cwd, onlyBasicParsing, filePathInfo }));
      buildup = [line];
    } else {
      buildup.push(line);
    }

    prevIndent = indent;
  }

  const result = {};
  result[rootKey] = data;

  return result;
}

function isTruthy(defval) {
  if (typeof defval === 'string') {
    return defval == 'true';
  }

  if (!defval || id(defval) == 'false') {
    return false;
  }

  return true;
}

export default {
  parse,
  parseFile,
  makeTryable,
  tryOnTheFly,
  listify,
  values,
  id,
  isTruthy,
  fromJson
};
