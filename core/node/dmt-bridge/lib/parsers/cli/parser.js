function parseAt(keyword) {
  const data = { type: 'attr' };

  if (keyword.includes('=')) {
    [data.name, data.value] = keyword.split('=');
    return data;
  }

  let name;
  let afterSlash;
  let afterColon;

  if (keyword.indexOf('/')) {
    [name, afterSlash] = keyword.split('/');
  }

  if (name.indexOf(':') != -1) {
    [name, afterColon] = name.split(':');
  } else if (afterSlash && afterSlash.indexOf(':') != -1) {
    [afterSlash, afterColon] = afterSlash.split(':');
  }

  data.name = name;

  if (afterSlash) {
    data.afterSlash = afterSlash;
  }

  if (afterColon) {
    data.afterColon = afterColon;
  }

  return data;
}

function parseSlash(keyword) {
  return parseAt(`this/${keyword}`);
}

function parseNegative(arg) {
  return { term: arg, type: 'negativeTerm' };
}

function parseExact(arg) {
  return { term: arg, type: 'exactTerm' };
}

function parseNext(arg) {
  return { operator: 'next', count: arg.length };
}

function parseOr(arg) {
  return { terms: arg.split('|'), type: 'orTerms' };
}

function parseArg(arg) {
  let parsed;

  const parserDef = [
    { startsWith: '@', parse: parseAt },
    { startsWith: '/', parse: parseSlash },
    { startsWith: '-', parse: parseNegative },
    { startsWith: '~', parse: parseExact },
    { oneOrMany: '^', parse: parseNext },
    { containsChar: '|', parse: parseOr }
  ];

  for (const def of parserDef) {
    if (def.startsWith && arg.startsWith(def.startsWith)) {
      parsed = def.parse(arg.slice(def.startsWith.length));
      break;
    }

    if (def.oneOrMany && arg.startsWith(def.oneOrMany) && arg.length == arg.split(def.oneOrMany).length - 1) {
      parsed = def.parse(arg);
      break;
    }

    if (def.containsChar && arg.indexOf(def.containsChar) > -1) {
      parsed = def.parse(arg);
      break;
    }
  }

  if (parsed) {
    return Object.assign(parsed, { originalArg: arg });
  }

  return arg;
}

function parseCommandArguments(args) {
  let parsedArgs = [];

  for (const arg of args) {
    if (arg.includes(' ')) {
      parsedArgs.push(...arg.split(' ').map(arg => parseArg(arg)));
    } else {
      parsedArgs.push(parseArg(arg));
    }
  }

  return parsedArgs;
}

module.exports = parseCommandArguments;
