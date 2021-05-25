import { unfurl } from 'unfurl.js';

import colors from 'colors';

import { latestLinkIndexVersion } from 'dmt/webindex';

import { concurrency } from 'dmt/connectome';

const { promiseTimeout } = concurrency;

const readTitleTimeoutMs = 5000;

export default function scanWebLink({ existingLinkIndex, url, tags, context, hiddenContext, linkNote, filePath }) {
  return new Promise((success, reject) => {
    const match = existingLinkIndex.find(linkInfo => linkInfo.url.toLowerCase() == url.toLowerCase() && linkInfo.linkIndexVersion == latestLinkIndexVersion);

    if (match) {
      console.log(colors.gray(`Found existing match in linkIndex for url ${colors.white(url)}:`));
      success({ ...match, ...{ tags, context, hiddenContext, linkNote, filePath } });
    } else {
      const data = { url, tags, context, hiddenContext, linkNote, linkIndexVersion: latestLinkIndexVersion };

      if (url.endsWith('.pdf')) {
        success({ ...data, ...{ title: '' } });
      } else if (url.indexOf('/localhost') > -1) {
        success({ ...data, ...{ title: 'WARNING: LOCAL LINK' } });
      } else {
        try {
          promiseTimeout(readTitleTimeoutMs, unfurl(url))
            .then(urlmetadata => {
              if (!urlmetadata) {
                console.log('NO URL METADATA');
              }
              let { title } = urlmetadata;
              title = title || '';

              console.log(colors.green(`✓ Received metadata ${colors.cyan(title)} for ${colors.white(url)}`));
              if (title.startsWith(context) || title.endsWith(context)) {
                context = '';
              }
              if (context.startsWith(title)) {
                title = context;
                context = '';
              }

              success({ ...data, ...{ title, context, urlmetadata } });
            })
            .catch(e => {
              console.log(colors.red(`read url metadata ${url} - ${e.message}`));
              success({ error: e.message, url });
            });
        } catch (e) {
          console.log('UNHANDLED ERROR:');
          console.log(e);
          console.log(url);
          process.exit();
        }
      }
    }
  });
}
