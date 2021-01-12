import dmt from 'dmt/bridge';
const { log } = dmt;

import MidLoader from '../middleware';

export default function loadMiddleware(program, mids) {
  return new Promise((success, reject) => {
    log.gray('Starting to load middleware ...');

    const midLoader = new MidLoader();

    const userMid = 'meta/load-user-core';

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
          program.emit('user_core_ready');

          success();
        });
      });
    }
  });
}
