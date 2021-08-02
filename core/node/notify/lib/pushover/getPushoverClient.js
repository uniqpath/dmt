import pushoverApi from './pushoverApi';
import { getAppToken } from './pushoverDef';
import { dmtApp } from './dmtApp';

function getPushoverClient(appName = dmtApp) {
  const token = getAppToken(appName);
  if (token) {
    return new pushoverApi.Client(token);
  }
}

export default getPushoverClient;
