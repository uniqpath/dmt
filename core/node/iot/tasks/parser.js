import path from 'path';
import fs from 'fs';

import { def, dmtUserDir } from 'dmt/common';

function getTasks() {
  const iotDef = path.join(dmtUserDir, 'def/iot.def');
  if (fs.existsSync(iotDef)) {
    return def.parseFile(iotDef).multi;
  }

  return [];
}

export { getTasks };
