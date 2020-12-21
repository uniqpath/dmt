import dmt from 'dmt/bridge';

import enhanceFS from './enhanceFSResult';
import enhanceNote from './enhanceNoteResult';

const { log } = dmt;

function enhanceResult({ result, providerAddress, providerPort, providerKey, searchOriginHost }) {
  const { filePath, isNote, url } = result;

  if (filePath) {
    enhanceFS(result, { providerAddress, providerPort, providerKey, searchOriginHost });
    return;
  }

  if (isNote) {
    enhanceNote(result, { searchOriginHost });
    return;
  }

  if (url) {
    return;
  }

  log.red('Unknown search result type:');
  log.red(result);
}

export default enhanceResult;
