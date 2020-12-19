import dmt from 'dmt/bridge';

import fs from 'fs';
import path from 'path';

class FileStore {
  constructor({ dir }) {
    this.dir = dir;
  }

  saveUserProfile({ ethAddress, userName, userEmail }) {
    console.log(`Saving user profile ${ethAddress}`);
    console.log(userName);
    console.log(userEmail);
    const fileName = this.getFileName(ethAddress);

    const data = { userName, userEmail };
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  }

  readUserProfile(ethAddress) {
    const fileName = this.getFileName(ethAddress);
    if (fs.existsSync(fileName)) {
      return JSON.parse(fs.readFileSync(fileName).toString());
    }

    return {};
  }

  getFileName(ethAddress) {
    return path.join(this.dir, `${ethAddress}_user_profile.json`);
  }
}

export default FileStore;
