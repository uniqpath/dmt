import pushoverApi from './pushoverApi/index.js';
import { getAppToken } from './pushoverDef.js';
import { dmtApp } from './dmtApp.js';

export default function getPushoverClient(appName = dmtApp) {
  const token = getAppToken(appName);
  if (token) {
    return new pushoverApi.Client(token);
  }
}
