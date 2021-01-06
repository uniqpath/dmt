import dmt from 'dmt/bridge';
const { log } = dmt;

import MidLoader from '../middleware';

export default function loadMiddleware(program, mids) {
  return new Promise((success, reject) => {
    log.gray('Starting to load middleware ...');

    const midLoader = new MidLoader();

    if (mids.includes('meta/load-user-core')) {
      midLoader.load({ program, mids: mids.filter(mid => mid != 'user') }).then(() => {
        midLoader.setup(program).then(() => {
          midLoader.load({ program, mids: ['user'] }).then(() => {
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
