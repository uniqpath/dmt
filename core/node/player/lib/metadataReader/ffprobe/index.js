import dmt from 'dmt/bridge';
const { log } = dmt;

import { execFile } from 'child_process';
import parseOutput from './parseOutput';

const { scan } = dmt;
const { commandExists } = scan;

let ffprobeCommandExists;
let ffprobeCommandMissing;

export default function ffprobe({ filePath }) {
  return new Promise((success, reject) => {
    if (ffprobeCommandMissing) {
      success({});
      return;
    }

    if (ffprobeCommandExists) {
      executeffprobe(filePath)
        .then(success)
        .catch(reject);
      return;
    }

    commandExists('ffprobe')
      .then(() => {
        ffprobeCommandExists = true;

        executeffprobe(filePath)
          .then(success)
          .catch(reject);
      })
      .catch(() => {
        log.red("⚠️  Warning: ffprobe doesn't exist on the system, id3 and other media metadata readings won't work.");
        ffprobeCommandMissing = true;
      });
  });
}

function executeffprobe(filePath) {
  return new Promise((success, reject) => {
    execFile('ffprobe', [filePath], (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      const id3 = parseOutput(stderr);

      success(id3);
    });
  });
}
