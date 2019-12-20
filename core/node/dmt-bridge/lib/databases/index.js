const fs = require('fs');
const helper = require('../parsers/def/dmtHelper');
const def = require('../parsers/def/parser');

const DbAccess = require('./dbAccess');

let dbDef;

const dbAccessCache = {};

function readDbDef() {
  const filePath = helper.deviceDefFile('this', 'db');

  if (fs.existsSync(filePath)) {
    const dbDef = def.parseFile(filePath, { onlyBasicParsing: true });

    return dbDef;
  }
}

function databases(dbName) {
  if (!dbDef) {
    dbDef = readDbDef();
  }

  if (dbDef) {
    const match = dbDef.multi.find(db => db.id == dbName);

    if (match) {
      if (!dbAccessCache[match.id]) {
        dbAccessCache[match.id] = new DbAccess(Object.assign(match, { database: match.id }));
      }

      return dbAccessCache[match.id];
    }
  }
}

module.exports = databases;
