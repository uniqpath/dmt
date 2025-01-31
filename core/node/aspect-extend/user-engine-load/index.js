import fs from 'fs';
import path from 'path';

import { colors, dmtUserDir, log } from 'dmt/common';
import modifyPackageJson from './modifyPackageJson.js';

import deviceLoader from './deviceLoader.js';

const userEnginePath = path.join(dmtUserDir, 'engine');
const userEngineEntryPoint = path.join(userEnginePath, 'index.js');

async function init(program) {
  function userEngineReady(results) {
    deviceLoader(program, userEnginePath);

    const notificationsDir = path.join(userEnginePath, '_notifications');

    if (fs.existsSync(notificationsDir)) {
      log.green(`Loading dmt notifications from ${colors.cyan(notificationsDir)}`);
    }
    program.loadDirectoryRecursive(notificationsDir);

    let notificationsReloadTimeout;
    let notificationsReloadTimeout2;

    program.on('gui:reload', () => {
      clearTimeout(notificationsReloadTimeout);
      clearTimeout(notificationsReloadTimeout2);

      const now = new Date();
      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

      const DIFF = 30;

      notificationsReloadTimeout = setTimeout(() => {
        program.decommissionNotifiers();
        notificationsReloadTimeout2 = setTimeout(() => {
          program.loadDirectoryRecursive(notificationsDir);
        }, DIFF);
      }, Math.max(delay - DIFF, 0));
    });

    program.emit('user_engine_ready', results);
  }

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
