import path from 'path';

import { scan } from 'dmt/common';

import mqttClient from './createMqttClient.js';

const iotMessageHandlers = [];
const tickHandlers = [];

function loadIotModules({ program, modulesPath }) {
  const modules = scan.dir(modulesPath, { onlyFiles: true }).filter(file => path.extname(file) == '.js');

  if (!program.iotModulesHandlerAttached) {
    program.iotModulesHandlerAttached = true;

    mqttClient.receive(({ topic, msg }) => {
      for (const handler of iotMessageHandlers) {
        handler({ program, topic, msg });
      }
    });

    program.on('tick', () => {
      for (const handler of tickHandlers) {
        handler(program);
      }
    });
  }

  modules.forEach(mod =>
    import(mod).then(({ setup, handleMqttEvent, onProgramTick }) => {
      if (setup) {
        setup(program);
      }

      if (handleMqttEvent) {
        iotMessageHandlers.push(handleMqttEvent);
      }

      if (onProgramTick) {
        tickHandlers.push(onProgramTick);
      }
    })
  );
}

export default loadIotModules;
