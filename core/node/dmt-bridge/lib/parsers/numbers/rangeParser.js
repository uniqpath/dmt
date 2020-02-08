export { parse, numberMatches, orderedMatchingNumbers };

function parse(pattern) {
  if (Array.isArray(pattern)) {
    pattern = pattern.join(' ');
  }

  return pattern
    .replace(/-\s+/, '-')
    .replace(/\s+-/, '-')
    .replace(/,/g, ' ')
    .split(' ')
    .map(el => el.trim())
    .filter(el => el != '')
    .map(el => parseOneElement(el));
}

function parseOneElement(rangeOrNumPattern) {
  rangeOrNumPattern = rangeOrNumPattern.trim();

  if (rangeOrNumPattern.includes('-')) {
    const parts = rangeOrNumPattern.split('-');
    if (parts.length == 2) {
      let [_from, _to] = parts;

      if (_from != '') {
        _from = parseOneElement(_from);
      }

      if (_to != '') {
        _to = parseOneElement(_to);
      }

      if (_from.type == 'number' && _to.type == 'number') {
        return {
          type: 'range',
          from: _from.value,
          to: _to.value
        };
      }
    }
  }

  const matches = rangeOrNumPattern.match(new RegExp(/^(\d+)$/));
  if (matches) {
    return {
      type: 'number',
      value: parseInt(matches[0])
    };
  }
}

function numberMatches(num, { rangePattern, parsed }) {
  const _parsed = rangePattern ? parse(rangePattern) : parsed;

  for (const entry of _parsed) {
    if (entry.type == 'number' && entry.value == num) {
      return true;
    }

    if (entry.type == 'range' && num >= entry.from && num <= entry.to) {
      return true;
    }
  }

  return false;
}

function orderedMatchingNumbers({ rangePattern, parsed }) {
  const _parsed = rangePattern ? parse(rangePattern) : parsed;

  const list = [];

  for (const entry of _parsed) {
    if (entry.type == 'number') {
      list.push(entry.value);
    }

    if (entry.type == 'range') {
      for (let num = entry.from; num <= entry.to; num += 1) {
        list.push(num);
      }
    }
  }

  return list.sort((a, b) => a - b);
}
