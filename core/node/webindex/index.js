import linkIndexPath from './lib/linkIndexPath.js';
import latestLinkIndexVersion from './lib/linkIndexVersion.js';
import { entireLinkIndex, deviceLinkIndexWithoutDerivedData, rereadIndexLoop } from './lib/readLinkIndex.js';

function init(program) {
  program.on('ready', () => {
    rereadIndexLoop({ program });
  });
}

export { init, linkIndexPath, latestLinkIndexVersion, entireLinkIndex, deviceLinkIndexWithoutDerivedData };
