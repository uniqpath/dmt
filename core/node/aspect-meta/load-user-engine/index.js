import fs from 'fs';
import path from 'path';

import { colors, dmtUserDir } from 'dmt/common';
import modifyPackageJson from './modifyPackageJson.js';

async function init(program) {
  function userEngineReady(results) {
    program.emit('user_engine_ready', results);
  }

  const userEnginePath = path.join(dmtUserDir, 'engine');
  const userEngineEntryPoint = path.join(userEnginePath, 'index.js');

  modifyPackageJson(userEnginePath);

  if (fs.existsSync(userEngineEntryPoint)) {
    const userEngineImports = await import(userEngineEntryPoint);

    if (userEngineImports.init) {
      const results = userEngineImports.init(program);
      userEngineReady(results);
    } else {
      userEngineReady();

      throw new Error(
        `User Engine entry point ${colors.yellow(userEngineEntryPoint)} exists but does not ${colors.cyan('export function init(program) { … }')}`
      );
    }
  } else {
    userEngineReady();
  }
}

export { init };
