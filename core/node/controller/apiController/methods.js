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

  methods.push({ name: 'open_door', handler: doorHandler });
  methods.push({ name: 'open_door_zatoglav', handler: zatoglavDoorHandler });
  methods.push({ name: 'move_fence', handler: fenceHandler });
  methods.push({ name: 'sleep_andreja', handler: sleepaHandler });
  methods.push({ name: 'sleep_david', handler: sleepdHandler });

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

function doorHandler({ args, program }) {
  return new Promise((success, reject) => {
    log.green('door open called');

    const obj = program.downstream('83cecb26a216d373098498e841b8c274b6f49c1c408ca90f3b5a72b8ebffcd14');

    if (!obj) {
      const e = 'no downstream channel';
      log.red(e);
      success(e);
      return;
    }

    obj
      .call('open_door')
      .then(success)
      .catch(e => {
        log.red(e);
        success();
      });
  });
}

function zatoglavDoorHandler({ args, program }) {
  return new Promise((success, reject) => {
    log.green('door open called');

    const obj = program.downstream('9bb395c81bbcbc561b2e8ae368d957a2169fa72791a189cfbffd0cddbf37f90e');

    if (!obj) {
      const e = 'no downstream channel';
      log.red(e);
      success(e);
      return;
    }

    obj
      .call('open_door')
      .then(success)
      .catch(e => {
        log.red(e);
        success();
      });
  });
}

function fenceHandler({ args, program }) {
  return new Promise((success, reject) => {
    log.green('fence move called');

    const obj = program.downstream('83cecb26a216d373098498e841b8c274b6f49c1c408ca90f3b5a72b8ebffcd14');

    if (!obj) {
      const e = 'no downstream channel';
      log.red(e);
      success(e);
      return;
    }

    obj
      .call('open_fence')
      .then(success)
      .catch(e => {
        log.red(e);
        success();
      });
  });
}

function sleepaHandler({ args, program }) {
  const { deviceName } = args;
  return new Promise((success, reject) => {
    const obj = program.downstream('1318d33fc8daf2bb4ccfed533b84c27d0dcb9a788d7de75bb1279b27fa52fe46');

    if (!obj) {
      const e = 'no downstream channel';
      log.red(e);
      success(e);
      return;
    }

    obj
      .call('sleep')
      .then(success)
      .catch(e => {
        log.red(e);
        success();
      });
  });
}

function sleepdHandler({ args, program }) {
  const { deviceName } = args;
  return new Promise((success, reject) => {
    const obj = program.downstream('b26b1fbae57661ee706107262a60e165d58e6efdb3d4f00785939a364270f860');
    if (!obj) {
      const e = 'no downstream channel';
      log.red(e);
      success(e);
      return;
    }

    obj
      .call('sleep')
      .then(success)
      .catch(e => {
        log.red(e);
        success();
      });
  });
}

const methods = getMethods();

export default methods;
