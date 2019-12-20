const path = require('path');
const fs = require('fs');

const dmtHelper = require('../dmtHelper');

function checkIfNotNull(val, { id, str }) {
  if (val) {
    return val;
  }

  throw new Error(`The element with id=${id} is missing, context info: ${str}`);
}

module.exports = (str, { def, cwd }) => {
  const re = new RegExp(/(.*?) \[from\] (.*?\.def)/);
  const matches = re.exec(str);
  if (matches) {
    const ids = matches[1].split(',').map(id => id.trim());
    const file = matches[2];

    let filePath = path.join(cwd, file);

    if (file.startsWith('user/')) {
      filePath = path.join(dmtHelper.userDir, file.replace('user/', 'def/'));
    }

    if (fs.existsSync(filePath)) {
      const parsedDef = def.parseFile(filePath);
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
};
