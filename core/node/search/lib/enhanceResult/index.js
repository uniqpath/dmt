import dmt from 'dmt/bridge';

import enhanceFS from './enhanceFSResult';
const { log } = dmt;

function enhanceResult({ result, providerAddress, providerPort, providerKey, searchOriginHost }) {
  const { resultType } = result;

  if (resultType == 'fs') {
    enhanceFS(result, { providerAddress, providerPort, providerKey, searchOriginHost });
  }
}

export default enhanceResult;
