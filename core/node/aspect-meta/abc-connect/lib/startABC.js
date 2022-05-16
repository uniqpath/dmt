import { fork } from 'child_process';

import { abcProcPath } from 'dmt/common';

export default function startABC() {
  return new Promise((success, reject) => {
    const child = fork(abcProcPath, [], { detached: true, stdio: 'ignore' });

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
