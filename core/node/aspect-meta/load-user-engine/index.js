import fs from 'fs';
import path from 'path';
import dmt from 'dmt/common';

async function init(program) {
  function userEngineReady(results) {
    program.emit('user_engine_ready', results);
  }

  const userEnginePath = path.join(dmt.userDir, 'engine');
  const userEngineEntryPoint = path.join(userEnginePath, 'index.js');

  if (fs.existsSync(userEngineEntryPoint)) {
    const userEngineImports = await import(userEngineEntryPoint);

    if (userEngineImports.default.init) {
      const results = userEngineImports.default.init(program);
      userEngineReady(results);
    } else {
      userEngineReady();
    }
  } else {
    userEngineReady();
  }
}

export { init };
