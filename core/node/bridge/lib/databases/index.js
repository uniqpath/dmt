import fs from 'fs';
import helper from '../dmtHelper';
import def from '../parsers/def/parser';
import DbAccess from './dbAccess';

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

export default databases;
