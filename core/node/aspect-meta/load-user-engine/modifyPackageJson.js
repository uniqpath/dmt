import fs from 'fs';
import path from 'path';
import dmt from 'dmt/common';
const { log } = dmt;

export default function modifyPackageJson(userEnginePath) {
  const packageJsonPath = path.join(userEnginePath, 'package.json');

  const userEngineScriptsPath = path.join(dmt.dmtPath, 'etc/scripts/prepare_apps_and_user_engine/dmt_user_engine');
  const exportsPath = path.join(userEngineScriptsPath, 'exports.json');

  if (fs.existsSync(exportsPath)) {
    const exportsJson = JSON.parse(fs.readFileSync(exportsPath).toString());

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
      if (JSON.stringify(packageJson.exports) != JSON.stringify(exportsJson)) {
        log.magenta('Resetting named exports in DMT USER ENGINE package.json');
        packageJson.exports = exportsJson;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
    }
  }
}
