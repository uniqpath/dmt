import { unfurl } from 'unfurl.js';

import colors from 'colors';

import { concurrency } from 'dmt/connectome';

import detectLinkMediaType from './detectLinkMediaType';
import treatUrlmetadata from './treatUrlmetadata';

const { promiseTimeout } = concurrency;

const readMetadataTimeoutMs = 5000;

export default function scanWebLink(linkEntry) {
  return new Promise((success, reject) => {
    const { url } = linkEntry;

    const mediaType = detectLinkMediaType(url);

    if (mediaType) {
      success(linkEntry);
      return;
    }

    try {
      promiseTimeout(readMetadataTimeoutMs, unfurl(url))
        .then(urlmetadata => {
          if (urlmetadata) {
            console.log(colors.green(`✓ Received metadata for ${colors.white(url)}`));
            success({ ...linkEntry, urlmetadata: treatUrlmetadata(urlmetadata) });
          } else {
            console.log('NO URL METADATA');
            success(linkEntry);
          }
        })
        .catch(e => {
          console.log(colors.red(`⚠️  error fetching url metadata for: ${url} - ${e.message}`));
          success({ url, error: e.message });
        });
    } catch (e) {
      console.log('UNHANDLED ERROR:');
      console.log(e);
      console.log(url);
      process.exit();
    }
  });
}
