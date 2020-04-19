import dmt from 'dmt-bridge';
const { log } = dmt;

function getActions() {
  const actions = [];

  actions.push({ command: 'info', handler: infoHandler });
  actions.push({ command: 'gui_test', handler: guiTestHandler });

  actions.push({ command: 'services', handler: servicesHandler });
  actions.push({ command: 'log', handler: logHandler });

  return actions;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: getActions().map(action => action.command) };
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

const actions = getActions();

export default actions;
