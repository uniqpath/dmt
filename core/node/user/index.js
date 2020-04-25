import fs from 'fs';
import path from 'path';
import dmt from 'dmt/bridge';

async function init(program) {
  function coreReady(results) {
    program.emit('user_core_ready', results);
  }

  const userCore = path.join(dmt.userDir, 'core/node/index.js');

  if (fs.existsSync(userCore)) {
    const userCoreImports = await import(userCore);

    if (userCoreImports.default.init) {
      const results = userCoreImports.default.init(program);
      coreReady(results);
    } else {
      coreReady();
    }
  } else {
    coreReady();
  }
}

export { init };
