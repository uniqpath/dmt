import pushoverApi from './pushoverApi/index.js';
import { getAppToken } from './pushoverDef.js';
import { dmtApp } from './dmtApp.js';

function getPushoverClient(appName = dmtApp) {
  const token = getAppToken(appName);
  if (token) {
    return new pushoverApi.Client(token);
  }
}

export default getPushoverClient;
