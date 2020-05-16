import fs from 'fs';
import dmt from 'dmt/bridge';

const { def } = dmt;

function readMetamaskDef(filePath) {
  if (!fs.existsSync(filePath)) {
    return { empty: true };
  }

  const data = def.parseFile(filePath);

  const people = def.makeTryable(data.people ? data.people : { empty: true });

  return def.listify(people.name);
}

export default readMetamaskDef;
