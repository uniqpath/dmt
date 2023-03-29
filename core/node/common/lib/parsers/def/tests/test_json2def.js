import fs from 'fs';
import path from 'path';

import { def2json, json2def } from 'dmt-defjson';

const filePath = path.join(dmt.dmtUserDir, 'def/pushover.def');

if (fs.existsSync(filePath)) {
  const defString = fs.readFileSync(filePath).toString();

  const json1 = def2json(defString);
  const json2 = { pushover: dmt.userDef('pushover').multi[0] };

  console.log(JSON.stringify(json1, null, 2));
  console.log();
  console.log(JSON.stringify(json2, null, 2));

  console.log();

  console.log(json1);
  console.log();
  console.log(json2);

  console.log(json2def(json1));
  console.log(json2def(json2));
}
