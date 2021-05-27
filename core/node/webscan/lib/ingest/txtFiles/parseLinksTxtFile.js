function emptyLine(line) {
  return line == '';
}

function isLink(line) {
  return line.startsWith('http');
}

function tripleDashComment(line) {
  return line.startsWith('---');
}

function trimAndRemoveComments(line) {
  if (isLink(line)) {
    return line.trim();
  }
  return line.split('#')[0].trim();
}

function cleanContext(line) {
  if (line.endsWith(':')) {
    return line.slice(0, -1);
  }
  return line;
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
  let tags;
  let boost;

  lines.forEach((line, index) => {
    line = trimAndRemoveComments(line);

    if (!emptyLine(line)) {
      if (!isLink(line) && !tripleDashComment(line) && !isTags(line) && !isBoost(line)) {
        context = cleanContext(line);
      }

      if (isTags(line)) {
        tags = extractTags(line);
      }

      if (isBoost(line)) {
        boost = extractBoost(line);
      }

      if (isLink(line)) {
        const result = { url: line, boost, context, manualTags: tags, filePath: filePath.split('/weblinks')[1] };

        urls.push(result);

        context = '';
        boost = undefined;
        tags = undefined;
      }
    }
  });

  return urls;
}

export default parseLinksTxtFile;
