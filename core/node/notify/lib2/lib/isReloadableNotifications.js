import { fileURLToPath } from 'url';
import { dirname } from 'path';

const LOC = 'user/engine/_notifications';

export function isReloadableNotifications(error, metaUrl) {
  const stack = error.stack.split('\n');
  const callerFile = fileURLToPath(metaUrl);
  const callerDir = dirname(callerFile);

  for (let i = 1; i < stack.length; i++) {
    const line = stack[i];
    const match = line.match(/\s+at\s+.+\s+\((.+?):\d+:\d+\)/);
    if (match) {
      let filePath = match[1];
      if (filePath.startsWith('file://')) {
        filePath = fileURLToPath(filePath);
      }
      if (filePath !== callerFile && !filePath.startsWith(callerDir)) {
        return filePath.includes(LOC);
      }
    }
  }

  return undefined;
}
