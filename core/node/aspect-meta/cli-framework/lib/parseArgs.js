function parseCliArgs(arr) {
  if (!Array.isArray(arr)) {
    arr = arr.trim().split(' ');
  }

  const result = {};

  let key;

  for (const arg of arr) {
    if (arg.startsWith('--')) {
      key = arg.replace('--', '');
      result[key] = true;
    } else if (arg.startsWith('-')) {
      key = arg.replace('-', '');
      result[key] = true;
    } else if (key) {
      result[key] = typeof result[key] == 'string' ? result[key] : '';
      result[key] = `${result[key]} ${arg}`.trim();
    } else {
      result.error = true;
      return result;
    }
  }

  return result;
}

export default parseCliArgs;
