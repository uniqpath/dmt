const path = require('path');
const fs = require('fs');

class FsState {
  constructor(stateDir) {
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir);
    }

    this.stateDir = stateDir;
  }

  stateFile(name) {
    return path.join(this.stateDir, name);
  }

  getBool(name) {
    return fs.existsSync(this.stateFile(name));
  }

  setBool(name, val = true) {
    const stateFile = this.stateFile(name);
    if (val && !this.getBool(name)) {
      fs.closeSync(fs.openSync(stateFile, 'w'));
    } else if (!val && this.getBool(name)) {
      fs.unlinkSync(stateFile);
    }
  }
}

module.exports = FsState;
