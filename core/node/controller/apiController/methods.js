import { log, services } from 'dmt/common';

function getMethods() {
  const methods = [];

  methods.push({ name: 'info', handler: infoHandler });
  methods.push({ name: 'gui_notify', handler: guiNotifyHandler });
  methods.push({ name: 'gui_nearby_test', handler: guiNearbyTestHandler });
  methods.push({ name: 'gui_dev_nearby_test', handler: guiDevNearbyTestHandler });

  methods.push({ name: 'services', handler: servicesHandler });
  methods.push({ name: 'log', handler: logHandler });

  methods.push({ name: 'nearby', handler: nearbyHandler });
  methods.push({ name: 'nearbyNotification', handler: nearbyNotificationHandler });
  methods.push({ name: 'state', handler: stateHandler });
  methods.push({ name: 'connections', handler: connectionsHandler });
  methods.push({ name: 'protocols', handler: protocolsHandler });
  methods.push({ name: 'apis', handler: listApisHandler });
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

function guiNotifyHandler({ args, program }) {
  const ttl = 20;

  clearTimeout(testCountResetTimeout);
  testCountResetTimeout = setTimeout(() => {
    testCount = 0;
  }, ttl * 1000);
  testCount += 1;

  return new Promise((success, reject) => {
    const msg = args || `GUI NOTIFY ${testCount}`;
    program.showNotification({ msg, ttl, color: '#6163D1' });
    success();
  });
}

function guiNearbyTestHandler({ args, program }) {
  const ttl = 10;

  clearTimeout(testCountResetTimeout);
  testCountResetTimeout = setTimeout(() => {
    testCount = 0;
  }, ttl * 1000);
  testCount += 1;

  return new Promise((success, reject) => {
    const msg = args || `NEARBY TEST ${testCount}`;
    program.nearbyNotification({ msg, ttl, color: '#3D2CD3' });
    success({ msg });
  });
}

function guiDevNearbyTestHandler({ args, program }) {
  const ttl = 10;

  clearTimeout(testCountResetTimeout);
  testCountResetTimeout = setTimeout(() => {
    testCount = 0;
  }, ttl * 1000);
  testCount += 1;

  return new Promise((success, reject) => {
    const msg = args || `DEV NEARBY TEST ${testCount}`;
    program.nearbyNotification({ msg, ttl, color: '#34FFF9', dev: true });
    success({ msg });
  });
}

function servicesHandler({ args }) {
  const service = args[0];
  return new Promise((success, reject) => {
    try {
      success(services(service));
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
    success(program.slot('nearbyDevices').get());
  });
}

function nearbyNotificationHandler({ args, program }) {
  return new Promise((success, reject) => {
    const { dev, msg, title, omitDeviceName } = args;
    program.nearbyNotification({ title, msg, dev, omitDeviceName });
    success();
  });
}

function stateHandler({ args, program }) {
  return new Promise((success, reject) => {
    success({ state: program.store().get() });
  });
}

function protocolsHandler({ args, program }) {
  return new Promise((success, reject) => {
    success({ registeredProtocols: program.acceptor.registeredProtocols() });
  });
}

function listApisHandler({ args, program }) {
  return new Promise((success, reject) => {
    success({ registeredActors: program.registeredApis() });
  });
}

function reachHandler({ args, program }) {
  return new Promise((success, reject) => {
    success('device actor :: reach method => [todo, missing implementation]');
  });
}

const methods = getMethods();

export default methods;
