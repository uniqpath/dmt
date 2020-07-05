import path from 'path';

import scrapeYt from 'scrape-yt';
import urlModule from 'url';

import readTitle from 'read-title';
import colors from 'colors';

import latestLinkIndexVersion from './linkIndexVersion';

import getGitHubLink from './getGitHubLink';

import readLinkIndex from './readLinkIndex';

const existingLinkIndex = readLinkIndex();

export default function scanWebLink({ url, context, filePath, githubLineNum }) {
  return new Promise((success, reject) => {
    const hiddenContext = path.basename(filePath);

    const match = existingLinkIndex.find(linkInfo => linkInfo.url.toLowerCase() == url.toLowerCase() && linkInfo.linkIndexVersion == latestLinkIndexVersion);

    if (match) {
      console.log(colors.green(`✓ Found existing match in linkIndex for url ${colors.white(url)}:`));
      console.log(match);

      success(match);
    } else {
      getGitHubLink({ filePath, githubLineNum }).then(githubReference => {
        const data = { url, context, hiddenContext, linkIndexVersion: latestLinkIndexVersion, githubReference };

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
                console.log(colors.gray(`Received title ${colors.cyan(title)} for video ${colors.white(url)}`));
                success({ ...data, ...{ title } });
              })
              .catch(error => {
                success({ ...{ error: 'VIDEO UNAVAILABLE OR SCRAPING TITLE FAILED' }, ...data });
              });
          } catch (e) {
            console.log('UNHANDLED ERROR YT SCRAPE:');
            console.log(colors.red(e));
            console.log(url);
            process.exit();
          }
        } else {
          try {
            readTitle(url)
              .then(title => {
                console.log(colors.gray(`Received title ${colors.cyan(title)} for ${colors.white(url)}`));
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
                console.log(e);
                reject(e);
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
