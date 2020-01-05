import path from 'path';

import dmt from 'dmt-bridge';
const { scan } = dmt;

function loadIotModules({ program, modulesPath }) {
  const modules = scan.dir(modulesPath, { onlyFiles: true }).filter(file => path.extname(file) == '.js');

  modules.forEach(mod =>
    import(mod).then(({ setup, handleIotEvent, manageTick }) => {
      if (setup) {
        setup(program);
      }

      if (handleIotEvent) {
        program.on('iot:message', ({ topic, msg }) => {
          handleIotEvent({ program, topic, msg });
        });
      }

      if (manageTick) {
        program.on('tick', () => {
          manageTick(program);
        });
      }
    })
  );
}

export default loadIotModules;
