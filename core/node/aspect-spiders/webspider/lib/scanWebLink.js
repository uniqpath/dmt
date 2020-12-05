import scrapeYt from 'scrape-yt';
import urlModule from 'url';

import readTitle from 'read-title';
import colors from 'colors';

import { latestLinkIndexVersion } from 'dmt/webindex';

import { concurrency } from 'dmt/connectome';

const { promiseTimeout } = concurrency;

import getGitHubLink from './getGitHubLink';

const readTitleTimeoutMs = 5000;

export default function scanWebLink({ existingLinkIndex, url, context, hiddenContext, linkNote, filePath, githubLineNum }) {
  return new Promise((success, reject) => {
    const match = existingLinkIndex.find(linkInfo => linkInfo.url.toLowerCase() == url.toLowerCase() && linkInfo.linkIndexVersion == latestLinkIndexVersion);

    if (match) {
      console.log(colors.gray(`Found existing match in linkIndex for url ${colors.white(url)}:`));
      success({ ...match, ...{ context, hiddenContext, linkNote, filePath, githubLineNum } });
    } else {
      getGitHubLink({ filePath, githubLineNum }).then(githubReference => {
        const data = { url, context, hiddenContext, linkNote, linkIndexVersion: latestLinkIndexVersion, githubReference };

        if (url.endsWith('.pdf')) {
          success({ ...data, ...{ title: '' } });
        } else if (url.indexOf('/localhost') > -1) {
          success({ ...data, ...{ title: 'WARNING: LOCAL LINK' } });
        } else if (url.indexOf('youtube.com') > -1 && url.indexOf('v=') > -1) {
          const videoId = urlModule.parse(url, { parseQueryString: true }).query['v'];
          try {
            scrapeYt
              .getVideo(videoId)
              .then(({ title }) => {
                console.log(colors.green(`✓ Received title ${colors.cyan(title)} for video ${colors.white(url)}`));
                success({ ...data, ...{ title } });
              })
              .catch(error => {
                console.log(colors.yellow('⚠️ VIDEO UNAVAILABLE OR SCRAPING TITLE FAILED'));
                console.log(error);

                success({ ...data, ...{ title: context } });
              });
          } catch (e) {
            console.log('UNHANDLED ERROR YT SCRAPE:');
            console.log(colors.red(e));
            console.log(url);
            success({ error: e.message, url });
          }
        } else {
          try {
            promiseTimeout(readTitleTimeoutMs, readTitle(url))
              .then(title => {
                if (!title) {
                  console.log('NO TITLE');
                }
                console.log(colors.green(`✓ Received title ${colors.cyan(title)} for ${colors.white(url)}`));
                if (title.startsWith(context) || title.endsWith(context)) {
                  context = '';
                }
                if (context.startsWith(title)) {
                  title = context;
                  context = '';
                }

                success({ ...data, ...{ title, context } });
              })
              .catch(e => {
                console.log(colors.red(`readTitle ${url} - ${e.message}`));
                success({ error: e.message, url });
              });
          } catch (e) {
            console.log('UNHANDLED ERROR:');
            console.log(e);
            console.log(url);
            process.exit();
          }
        }
      });
    }
  });
}
