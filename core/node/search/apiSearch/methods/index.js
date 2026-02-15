import searchHandler from './search.js';

function getMethods() {
  const methods = [];

  methods.push({ name: 'info', handler: infoHandler });
  methods.push({ name: 'search', handler: searchHandler });

  return methods;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: getMethods().map(method => method.name) };
    success(data);
  });
}

const methods = getMethods();

export default methods;
