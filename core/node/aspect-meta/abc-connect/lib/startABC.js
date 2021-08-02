import { fork } from 'child_process';

import dmt from 'dmt/common';

export default function startABC() {
  return new Promise((success, reject) => {
    const child = fork(dmt.abcProcPath, [], { detached: true, stdio: 'ignore', shell: true });

    child.on('error', err => {
      reject(err);
    });

    const checker = () => {
      if (child.connected) {
        success();
      } else {
        setTimeout(checker, 200);
      }
    };

    checker();

    child.unref();
  });
}
