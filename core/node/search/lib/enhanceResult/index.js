import enhanceFS from './enhanceFSResult.js';
import { log } from 'dmt/common';

function enhanceResult({ result, providerAddress, providerPort, providerKey, searchOriginHost }) {
  const { resultType } = result;

  if (resultType == 'fs') {
    enhanceFS(result, { providerAddress, providerPort, providerKey, searchOriginHost });
  }
}

export default enhanceResult;
