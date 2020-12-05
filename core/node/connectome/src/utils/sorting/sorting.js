function compareValues(key, key2) {
  const order = 'asc';

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

    return comparison;
  }

  return function innerSort(a, b) {
    let comparison = _comparison(a, b, key);

    if (comparison == 0 && key2) {
      comparison = _comparison(a, b, key2);
    }

    return order === 'desc' ? comparison * -1 : comparison;
  };
}

export { compareValues };
