import path from 'path';

import dmt from 'dmt-bridge';
const { scan } = dmt;

const iotMessageHandlers = [];
const tickHandlers = [];

function loadIotModules({ program, modulesPath }) {
  const modules = scan.dir(modulesPath, { onlyFiles: true }).filter(file => path.extname(file) == '.js');

  if (!program.iotModulesHandlerAttached) {
    program.iotModulesHandlerAttached = true;

    program.on('iot:message', ({ topic, msg }) => {
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
    import(mod).then(({ setup, handleIotEvent, manageTick }) => {
      if (setup) {
        setup(program);
      }

      if (handleIotEvent) {
        iotMessageHandlers.push(handleIotEvent);
      }

      if (manageTick) {
        tickHandlers.push(manageTick);
      }
    })
  );
}

export default loadIotModules;
