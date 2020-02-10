import path from 'path';
import stripAnsi from 'strip-ansi';

import dmt from 'dmt-bridge';

function mapToLocal(providerResults) {
  const { providerHost, contentId } = providerResults.meta;

  const share = dmt.getReferencedSambaShares().find(shareInfo => shareInfo.deviceId == providerHost && shareInfo.contentId == contentId);

  if (!share) {
    return providerResults;
  }

  const mapping = { from: share.sambaPath, to: share.mountPath };

  const mappedResults = providerResults.results.map(file => {
    const re = new RegExp(`^${mapping.from}/`);
    const str = stripAnsi(file);

    if (str.match(re)) {
      const relativePath = str.replace(re, './');
      return path.join(mapping.to, relativePath);
    }
  });

  return Object.assign(JSON.parse(JSON.stringify(providerResults)), { results: mappedResults });
}

export default mapToLocal;
