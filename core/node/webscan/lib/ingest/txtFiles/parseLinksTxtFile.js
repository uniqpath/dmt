import dmt from 'dmt/common';
const { util } = dmt;

function emptyLine(line) {
  return line == '';
}

function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const matches = text.match(urlRegex);

  if (matches) {
    let remains = text;

    for (const match of matches) {
      remains = remains.replace(match, '');
    }

    return [matches, remains.trim()];
  }

  return [[], text.trim()];
}

function isComment(line) {
  return line.startsWith('---') || line.startsWith('#');
}

function removeHashComments(line) {
  return line.split('#')[0].trim();
}

function cleanContext(context) {
  return util.trimAny(context, ['|', ':', ' ']).replace(/\s+/g, ' ');
}

function isTags(line) {
  return line.toLowerCase().startsWith('tags:');
}

function extractTags(line) {
  return line
    .toLowerCase()
    .replace('tags:', '')
    .split(',')
    .map(tag => tag.trim());
}

function isTitle(line) {
  return line.toLowerCase().startsWith('title:');
}

function extractTitle(line) {
  return line.replace('title:', '').trim();
}

function isBoost(line) {
  return line.toLowerCase().startsWith('boost:');
}

function extractBoost(line) {
  return parseInt(
    line
      .toLowerCase()
      .replace('boost:', '')
      .trim()
  );
}

function parseLinksTxtFile({ filePath, lines }) {
  const urls = [];

  let context = '';
  let title;
  let tags;
  let boost;

  lines.forEach((line, index) => {
    line = line.trim();

    if (!isComment(line) && !emptyLine(line)) {
      const [_urls, _remains] = extractUrls(line);
      const remains = removeHashComments(_remains);

      const hasLinks = _urls.length > 0;

      if (!hasLinks) {
        if (isTags(remains)) {
          tags = extractTags(line);
        } else if (isTitle(remains)) {
          title = extractTitle(line);
        } else if (isBoost(remains)) {
          boost = extractBoost(line);
        } else {
          context = cleanContext(remains);
        }
      } else {
        if (remains) {
          context = cleanContext(`${context} ${cleanContext(remains)}`);
        }

        for (const url of _urls) {
          if (url.includes(context)) {
            context = '';
          }

          const result = { url, boost, manualTitle: title, context, manualTags: tags, filePath: filePath.split('/weblinks')[1] };

          urls.push(result);
        }

        context = '';
        boost = undefined;
        title = undefined;
        tags = undefined;
      }
    }
  });

  return urls;
}

export default parseLinksTxtFile;
