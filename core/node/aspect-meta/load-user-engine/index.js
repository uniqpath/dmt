import fs from 'fs';
import path from 'path';
import dmt from 'dmt/common';

import modifyPackageJson from './modifyPackageJson';

async function init(program) {
  function userEngineReady(results) {
    program.emit('user_engine_ready', results);
  }

  const userEnginePath = path.join(dmt.userDir, 'engine');
  const userEngineEntryPoint = path.join(userEnginePath, 'index.js');

  modifyPackageJson(userEnginePath);

  if (fs.existsSync(userEngineEntryPoint)) {
    const userEngineImports = await import(userEngineEntryPoint);

    if (userEngineImports.init) {
      const results = userEngineImports.init(program);
      userEngineReady(results);
    } else {
      userEngineReady();
    }
  } else {
    userEngineReady();
  }
}

export { init };
