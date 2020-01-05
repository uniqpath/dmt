const path = require('path');

const modulesPath = path.join(__dirname, 'modules');

const powerline = require('./lib/powerline');

const IotBus = require('./lib/iotBus');

const removeStaleNearbySensorsData = require('./removeStaleNearbySensorsData');

const specialNodes = require('./lib/iotBus/specialNodes');

const Alarm = require('./lib/alarm');

const iotBus = new IotBus();

function init(program) {
  program.specialNodes = specialNodes();

  if (program.specialNodes.length > 0) {
    iotBus.init({ specialNodes: program.specialNodes });

    iotBus.on('message', msg => {
      program.emit('iot:message', msg);
    });

    import('./loadIotModules.mjs').then(exp => {
      exp.default({ program, modulesPath });
    });
  }

  removeStaleNearbySensorsData(program);
  program.on('tick', () => removeStaleNearbySensorsData(program));

  return { bus: iotBus };
}

module.exports = {
  init,
  iotBus,
  specialNodes,
  Alarm,
  powerline
};
