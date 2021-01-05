import fs from 'fs';
import dmt from 'dmt/bridge';

const { def } = dmt;

function readParaSearchDef(filePath) {
  if (!fs.existsSync(filePath)) {
    return { empty: true };
  }

  const zetaDef = def.parseFile(filePath);

  return def.makeTryable(zetaDef.multi.length > 0 ? zetaDef.zeta : { empty: true });
}

export default readParaSearchDef;
