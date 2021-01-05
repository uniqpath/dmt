import dmt from 'dmt/bridge';

import fs from 'fs';
import path from 'path';

// not really used as a store
class FileStore {
  constructor({ dir }) {
    // super();
    this.dir = dir;
  }

  saveUserProfile({ ethAddress, userName, userEmail }) {
    console.log(`Saving user profile ${ethAddress}`);
    console.log(userName);
    console.log(userEmail);
    const fileName = this.getFileName(ethAddress);

    // warning: don't forget if you add new fields!
    const data = { userName, userEmail };
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  }

  readUserProfile(ethAddress) {
    //console.log(`Reading user profile ${ethAddress}`);

    const fileName = this.getFileName(ethAddress);
    if (fs.existsSync(fileName)) {
      //console.log(JSON.parse(fs.readFileSync(fileName)));
      return JSON.parse(fs.readFileSync(fileName).toString());
    }

    return {};
  }

  getFileName(ethAddress) {
    return path.join(this.dir, `${ethAddress}_user_profile.json`);
  }
}

export default FileStore;
