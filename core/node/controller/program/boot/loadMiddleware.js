import { log } from 'dmt/common';

import MidLoader from '../middleware';

export default function loadMiddleware(program, mids) {
  return new Promise((success, reject) => {
    log.gray('Starting to load dmt-proc modules ...');

    const midLoader = new MidLoader();

    const userMid = 'meta/load-user-engine';

    if (mids.includes(userMid)) {
      midLoader.load({ program, mids: mids.filter(mid => mid != userMid) }).then(() => {
        midLoader.setup(program).then(() => {
          midLoader.load({ program, mids: [userMid] }).then(() => {
            success();
          });
        });
      });
    } else {
      midLoader.load({ program, mids }).then(() => {
        midLoader.setup(program).then(() => {
          program.emit('user_engine_ready');

          success();
        });
      });
    }
  });
}
