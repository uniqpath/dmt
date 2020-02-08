import path from 'path';
import fs from 'fs';

function checkIfNotNull(val, { id, str }) {
  if (val) {
    return val;
  }

  throw new Error(`The element with id=${id} is missing, context info: ${str}`);
}

export default operatorFrom;

function operatorFrom(str, { parseFile, cwd }) {
  const re = new RegExp(/(.*?) \[from\] (.*?\.def)/);
  const matches = re.exec(str);
  if (matches) {
    const ids = matches[1].split(',').map(id => id.trim());
    const file = matches[2];

    const filePath = path.join(cwd, file);

    if (fs.existsSync(filePath)) {
      const parsedDef = parseFile(filePath);
      if (ids.length == 1) {
        const id = ids[0];

        if (id == '*') {
          return checkIfNotNull(parsedDef.multi, { id, str });
        }

        return checkIfNotNull(parsedDef[id], { id, str });
      }

      return ids.map(id => checkIfNotNull(parsedDef[id], { id, str }));
    }

    throw new Error(`${filePath} doesn't exist`);
  }

  return str;
}
