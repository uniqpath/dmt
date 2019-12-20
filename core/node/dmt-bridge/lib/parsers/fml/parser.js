const stripAnsi = require('strip-ansi');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

const dmtHelper = require('../def/dmtHelper');
const scan = require('../../scan');

class FMLParser {
  constructor({ handle, channel, fiberAuth }) {
    this.handle = handle;
    this.channel = channel;
    this.fiberAuth = fiberAuth;
  }

  parse({ file = 'index.fml', linesProcessor = lines => lines } = {}) {
    const siteDir = `sites/${this.handle}`;
    const sitePath = path.join(dmtHelper.userDir, siteDir);

    if (!fs.existsSync(sitePath)) {
      return this.error(`FMLParser request for site ${colors.yellow(siteDir)} failed because path doesn't exist`);
    }

    const filePath = path.join(sitePath, file);

    if (!fs.existsSync(filePath)) {
      return this.error(`FMLParser request for file ${colors.yellow(file)} failed because file doesn't exist`);
    }

    const lines = linesProcessor(scan.readFileLines(filePath));

    let content = '';

    let prevLine = '';

    let openDiv;
    let openPre;

    let loginRequired;
    let logoutRequired;

    const allowedFor = [];
    let negateAllowedFor = false;

    let prevLineWasADeclaration = false;

    const assetList = [];

    for (const line of lines) {
      if (line.startsWith('--#')) {
        continue;
      }

      if (line.startsWith('-- ')) {
        if (['preformatted', 'smallerTextOnMobile', 'justify'].find(kw => line.toLowerCase().includes(kw))) {
          content = this.closeElements({ content, openDiv, openPre });
          openDiv = false;
          openPre = false;
        }

        if (line.match(new RegExp(/\bloggedIn\b/i))) {
          loginRequired = true;
          logoutRequired = false;
          allowedFor.length = 0;
        }

        const allowedHandles = line
          .replace(new RegExp(/^-- /), '')
          .split(',')
          .map(s => s.trim())
          .filter(part => part.startsWith('f/'))
          .map(part => part.replace(new RegExp(/^f\//), ''));

        if (allowedHandles.length > 0) {
          allowedFor.length = 0;
          allowedFor.push(...allowedHandles);
        }

        if (allowedHandles.length > 0) {
          negateAllowedFor = false;
        }

        if (allowedFor.length > 0) {
          loginRequired = false;
        }

        if (line.trim().toLowerCase() == '-- else') {
          if (allowedFor.length > 0) {
            negateAllowedFor = true;
          }

          if (loginRequired) {
            logoutRequired = true;
            loginRequired = false;
          }
        }

        if (line.trim().toLowerCase() == '-- end') {
          loginRequired = false;
          logoutRequired = false;
          allowedFor.length = 0;
        }

        if (this.isPermitted({ loginRequired, logoutRequired, allowedFor, negateAllowedFor })) {
          if (line.match(new RegExp(/\bpreformatted\b/i))) {
            content += '<pre style="text-align: left;">';
            openPre = true;
          }

          const smallerTextOnMobile = line.match(new RegExp(/\bsmallerTextOnMobile\b/i));
          const justify = line.match(new RegExp(/\bjustify\b/i));
          const wide = line.match(new RegExp(/\bwide\b/i));

          if (smallerTextOnMobile || justify || wide) {
            const divStart = this.getDivStart({ smallerTextOnMobile, justify, wide });
            content += divStart;
            openDiv = true;
          }

          const includeFileMatches = line.match(new RegExp(/^-- include (.*?)(?: through (.*?))?$/i));

          if (includeFileMatches && includeFileMatches[1]) {
            const includeFile = includeFileMatches[1];
            const scriptDir = includeFileMatches[2];

            let linesProcessor;

            if (scriptDir) {
              const scriptPath = path.join(sitePath, scriptDir);
              if (fs.existsSync(scriptPath)) {
                linesProcessor = require(scriptPath);
              }
            }

            const result = this.parse({ file: includeFile, linesProcessor });
            content = `${content}${result.html}`;
            assetList.push(...result.assetList);
          }

          if (line.startsWith('-- image')) {
            let assetId;

            const pickRandom = line.includes('-- image random ');

            const assetIdMatches = line.match(new RegExp(/^--\s+image\s+:(\w+)/i));
            if (assetIdMatches && assetIdMatches[1]) {
              assetId = assetIdMatches[1];
            }

            const imageIncludeMatches = line
              .replace('-- image random ', '-- image ')
              .replace(`:${assetId}`, '')
              .match(new RegExp(/^--\s+image\s+(.*?)$/i));

            if (imageIncludeMatches && imageIncludeMatches[1]) {
              const assetPath = imageIncludeMatches[1];

              const domId = assetPath;
              const assetRequest = { assetPath, domId };

              if (assetId) {
                assetRequest.assetId = assetId;
              }

              if (pickRandom) {
                assetRequest.pickRandom = true;
              }

              assetList.push(assetRequest);

              if (!assetId) {
                content = `${content}<p><img id=${domId} class="wire_img" /></p>`;
              }
            }
          }
        }

        prevLineWasADeclaration = true;
      } else {
        if (!line && prevLineWasADeclaration) {
          continue;
        }

        if (this.isPermitted({ loginRequired, logoutRequired, allowedFor, negateAllowedFor })) {
          content = this.addLine({ content, line, openPre, prevLine });
        }

        prevLineWasADeclaration = false;
      }

      prevLine = line;
    }

    content = this.closeElements({ content, openDiv, openPre });

    return { html: content, assetList };
  }

  error(message) {
    return { html: `<div class="error">${stripAnsi(message)}</div>`, assetList: [] };
  }

  isPermitted({ loginRequired, logoutRequired, allowedFor, negateAllowedFor }) {
    const allowed = allowedFor.find(handle => this.fiberAuth.parallelLogin({ channel: this.channel, handle }));
    const loggedIn = this.fiberAuth.parallelLogin({ channel: this.channel, handle: this.handle });

    const a = (!negateAllowedFor && allowed) || (negateAllowedFor && !allowed);

    const b = (loginRequired && loggedIn) || (logoutRequired && !loggedIn) || (!loginRequired && !logoutRequired);

    return (allowedFor.length != 0 && a) || (allowedFor.length == 0 && b);
  }

  addLine({ content, line, prevLine, openPre }) {
    function determineBreaks({ openPre }) {
      if (openPre) {
        return '<br>';
      }

      if (prevLine.trim() == '' || line == '') {
        return '<br><br>';
      }

      return '<br>';
    }

    return (content.endsWith('>') || !content) && line ? `${content} ${line}` : `${content}${determineBreaks({ openPre })}${line}`;
  }

  closeElements({ content, openDiv, openPre }) {
    if (openPre) {
      content += '</pre>';
    }

    if (openDiv) {
      content += '</div>';
    }

    return content;
  }

  getDivStart({ smallerTextOnMobile, justify }) {
    let attr = '';

    if (justify) {
      attr = `text-align: justify; ${attr}`;
    }

    let classes = '';

    if (smallerTextOnMobile) {
      classes = ' class="mobile_smaller_fonts"';
    }

    return `<div${classes} style="${attr}">`;
  }
}

module.exports = FMLParser;
