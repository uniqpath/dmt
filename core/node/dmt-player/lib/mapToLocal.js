import path from 'path';

import dmt from 'dmt-bridge';

function mapToLocal(providerResults) {
  const { providerHost, contentId } = providerResults.meta;

  const share = dmt.getReferencedSambaShares().find(shareInfo => shareInfo.deviceId == providerHost && shareInfo.contentId == contentId);

  if (!share) {
    return providerResults;
  }

  const mapping = { from: share.sambaPath, to: share.mountPath };

  const mappedResults = providerResults.results.map(result => {
    const re = new RegExp(`^${mapping.from}/`);

    const { filePath } = result;

    if (filePath.match(re)) {
      const relativePath = filePath.replace(re, './');
      return { ...result, ...{ filePath: path.join(mapping.to, relativePath) } };
    }

    return result;
  });

  return Object.assign(JSON.parse(JSON.stringify(providerResults)), { results: mappedResults });
}

export default mapToLocal;
