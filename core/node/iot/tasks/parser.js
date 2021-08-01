import path from 'path';
import fs from 'fs';
import dmt from 'dmt/common';
const { def } = dmt;

function getTasks() {
  const iotDef = path.join(dmt.userDir, 'def/iot.def');
  if (fs.existsSync(iotDef)) {
    return def.parse({ file: iotDef }).multi;
  }

  return [];
}

export { getTasks };
