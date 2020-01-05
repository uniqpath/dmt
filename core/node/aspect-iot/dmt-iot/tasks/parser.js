const path = require('path');
const fs = require('fs');
const dmt = require('dmt-bridge');
const { def } = dmt;

function getTasks() {
  const iotDef = path.join(dmt.userDir, 'def/iot.def');
  if (fs.existsSync(iotDef)) {
    return def.parse({ file: iotDef }).multi;
  }

  return [];
}

module.exports = { getTasks };
