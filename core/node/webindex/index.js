import dmt from 'dmt/common';

import linkIndexPath from './lib/linkIndexPath';
import latestLinkIndexVersion from './lib/linkIndexVersion';
import { entireLinkIndex, deviceLinkIndexWithoutDerivedData, rereadIndexLoop } from './lib/readLinkIndex';

function init(program) {
  program.on('ready', () => {
    rereadIndexLoop({ program });
  });
}

export { init, linkIndexPath, latestLinkIndexVersion, entireLinkIndex, deviceLinkIndexWithoutDerivedData };
