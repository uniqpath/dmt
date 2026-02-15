import map from './mapObj.js';
import snakeCase from './toSnakeCase.js';

export default snakeCaseKeys;

function snakeCaseKeys(obj, options) {
  options = Object.assign({ deep: true, exclude: [] }, options);

  return map(
    obj,
    (key, val) => {
      return [matches(options.exclude, key) ? key : snakeCase(key), val];
    },
    options
  );
}

function matches(patterns, value) {
  return patterns.some(pattern => {
    return typeof pattern === 'string' ? pattern === value : pattern.test(value);
  });
}
