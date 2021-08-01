import fs from 'fs';
import path from 'path';

// not really used as a store
class FileStore {
  constructor({ dir }) {
    // super();
    this.dir = dir;
  }

  saveUserProfile({ ethAccount, userName, userEmail }) {
    console.log(`Saving user profile ${ethAccount}`);
    console.log(userName);
    console.log(userEmail);
    const fileName = this.getFileName(ethAccount);

    // warning: don't forget if you add new fields!
    const data = { userName, userEmail };
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  }

  readUserProfile(ethAccount) {
    //console.log(`Reading user profile ${ethAccount}`);

    const fileName = this.getFileName(ethAccount);
    if (fs.existsSync(fileName)) {
      //console.log(JSON.parse(fs.readFileSync(fileName)));
      return JSON.parse(fs.readFileSync(fileName).toString());
    }

    return {};
  }

  getFileName(ethAccount) {
    return path.join(this.dir, `${ethAccount}_user_profile.json`);
  }
}

export default FileStore;
