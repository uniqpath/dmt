import fs from 'fs';
import path from 'path';

import { log, dmtPath } from 'dmt/common';

export default function modifyPackageJson(userEnginePath) {
  const packageJsonPath = path.join(userEnginePath, 'package.json');

  const userEngineScriptsPath = path.join(dmtPath, 'etc/scripts/prepare_apps_and_user_engine/dmt_user_engine');
  const exportsPath = path.join(userEngineScriptsPath, 'exports.json');
  const devDependenciesPath = path.join(userEngineScriptsPath, 'devDependencies.json');

  if (fs.existsSync(exportsPath)) {
    const exportsJson = JSON.parse(fs.readFileSync(exportsPath).toString());
    const devDependenciesJson = JSON.parse(fs.readFileSync(devDependenciesPath).toString());

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

      if (JSON.stringify(packageJson.exports) != JSON.stringify(exportsJson)) {
        log.magenta('Resetting named exports in DMT USER ENGINE package.json');
        packageJson.exports = exportsJson;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }

      if (JSON.stringify(packageJson.devDependencies || {}) != JSON.stringify(devDependenciesJson)) {
        log.magenta('Resetting devDependencies in DMT USER ENGINE package.json');
        packageJson.devDependencies = devDependenciesJson;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
    }
  }
}
