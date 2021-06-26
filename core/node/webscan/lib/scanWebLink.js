import { unfurl } from 'unfurl.js';

import colors from 'colors';

import { concurrency } from 'dmt/connectome';

import detectLinkMediaType from './detectLinkMediaType';
import treatUrlmetadata from './treatUrlmetadata';

const { promiseTimeout } = concurrency;

const readMetadataTimeoutMs = 5000;

const searchEnginesList = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)'
];

export default function scanWebLink(linkEntry) {
  return new Promise((success, reject) => {
    const { url } = linkEntry;

    const mediaType = detectLinkMediaType(url);

    if (mediaType) {
      success(linkEntry);
      return;
    }

    let userAgent;

    if (url.includes('amazon.com')) {
      userAgent = searchEnginesList[Math.floor(Math.random() * searchEnginesList.length)];
    }

    try {
      promiseTimeout(readMetadataTimeoutMs, unfurl(url, { userAgent }))
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
