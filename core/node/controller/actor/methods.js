import dmt from 'dmt/common';
const { log, util } = dmt;

function getMethods() {
  const methods = [];

  methods.push({ name: 'info', handler: infoHandler });
  methods.push({ name: 'gui_test', handler: guiTestHandler });

  methods.push({ name: 'services', handler: servicesHandler });
  methods.push({ name: 'log', handler: logHandler });

  methods.push({ name: 'nearby', handler: nearbyHandler });
  methods.push({ name: 'state', handler: stateHandler });
  methods.push({ name: 'connections', handler: connectionsHandler });
  methods.push({ name: 'protocols', handler: protocolsHandler });
  methods.push({ name: 'actors', handler: actorsHandler });
  methods.push({ name: 'reach', handler: reachHandler });

  return methods;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: getMethods().map(action => action.name) };
    success(data);
  });
}

let testCount = 0;
let testCountResetTimeout;

function guiTestHandler({ args, program }) {
  const ttl = 10;

  clearTimeout(testCountResetTimeout);
  testCountResetTimeout = setTimeout(() => {
    testCount = 0;
  }, ttl * 1000);
  testCount += 1;

  return new Promise((success, reject) => {
    const msg = args || `GUI TEST ${testCount}`;
    program.showNotification({ msg, ttl, bgColor: '#6163D1', color: 'white' });
    success({ msg });
  });
}

function servicesHandler({ args }) {
  const service = args[0];
  return new Promise((success, reject) => {
    try {
      success(dmt.services(service));
    } catch (e) {
      reject(e);
    }
  });
}

function logHandler({ args }) {
  return new Promise((success, reject) => {
    success(log.bufferLines(log.REPORT_LINES).map(el => el.msg));
  });
}

function connectionsHandler({ args, program }) {
  return new Promise((success, reject) => {
    const incoming = program.acceptor.connectionList({ warnForIsReady: false });

    const { fiberPool } = program;
    const outgoing = fiberPool.connectionList();

    success({
      incoming,
      outgoing
    });
  });
}

function nearbyHandler({ args, program }) {
  return new Promise((success, reject) => {
    success(program.store('nearbyDevices').get());
  });
}

function stateHandler({ args, program }) {
  return new Promise((success, reject) => {
    const state = program.store().get();
    success({ state });
  });
}

function protocolsHandler({ args, program }) {
  return new Promise((success, reject) => {
    success({ registeredProtocols: program.acceptor.registeredProtocols() });
  });
}

function actorsHandler({ args, program }) {
  return new Promise((success, reject) => {
    success({ registeredActors: program.actors.registeredActors() });
  });
}

function reachHandler({ args, program }) {
  return new Promise((success, reject) => {
    success('device actor :: reach method => [todo, missing implementation]');
  });
}

const methods = getMethods();

export default methods;
