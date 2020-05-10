import dmt from 'dmt/bridge';

import enhanceFS from './enhanceFSResult';
import enhanceSwarm from './enhanceSwarmResult';
import enhanceNote from './enhanceNoteResult';

const { log } = dmt;

function enhanceResult({ result, providerAddress, providerPort, searchOriginHost }) {
  const { filePath, swarmBzzHash, isNote } = result;

  if (filePath) {
    enhanceFS(result, { providerAddress, providerPort, searchOriginHost });
    return;
  }

  if (isNote) {
    enhanceNote(result, { searchOriginHost });
    return;
  }

  if (swarmBzzHash) {
    enhanceSwarm(result, { swarmGateway: 'https://swarm-gateways.net' });
    return;
  }

  log.red('Unknown search result type:');
  log.red(result);
}

export default enhanceResult;
