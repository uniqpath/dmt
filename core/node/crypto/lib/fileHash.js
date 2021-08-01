import crypto from 'crypto';
import fs from 'fs';
function hashOfFileContents(filePath) {
  return new Promise((success, reject) => {
    const hash = crypto.createHash('sha256');
    const readStream = fs.createReadStream(filePath);

    readStream.on('readable', () => {
      const data = readStream.read();
      if (data) {
        hash.update(data);
      } else {
        success(hash.digest('hex'));
      }
    });

    readStream.on('error', err => reject(new Error(`Problem hashing file ${filePath}: ${err.toString()}`)));
  });
}

export default hashOfFileContents;
