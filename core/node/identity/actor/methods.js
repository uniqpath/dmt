import dmt from 'dmt/bridge';
const { log, util } = dmt;

function getMethods() {
  const methods = [];

  methods.push({ name: 'info', handler: infoHandler });
  methods.push({ name: 'list', handler: listHandler });

  return methods;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: getMethods().map(action => action.name) };
    success(data);
  });
}

function listHandler({ args, program }) {
  return new Promise((success, reject) => {
    success({ identityList: ['1', '2', '3'] });
  });
}

const methods = getMethods();

export default methods;
