import path from 'path';
function emptyLine(line) {
  return line == '';
}

function isLink(line) {
  return line.startsWith('http');
}

function tripleDashComment(line) {
  return line.startsWith('---');
}

function isBeginNote(line) {
  return line.toLowerCase().replace(' ', '') == '---note';
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

function parseLinksTxtFile({ filePath, lines, existingLinkIndex, linksDirectory }) {
  const urls = [];

  let context = '';
  let note = [];
  let tags;

  let isInsideNote = false;

  lines.forEach((line, index) => {
    line = trimAndRemoveComments(line);

    if (!emptyLine(line)) {
      if (!isLink(line) && !tripleDashComment(line) && !isTags(line) && !isInsideNote) {
        context = cleanContext(line);
      }

      if (tripleDashComment(line) || isLink(line)) {
        isInsideNote = false;
      }

      if (isInsideNote) {
        note.push(line);
      }

      if (isBeginNote(line)) {
        isInsideNote = true;
      }

      if (isTags(line)) {
        tags = extractTags(line);
      }

      if (isLink(line)) {
        const linkNote = note.join('\n');

        const hiddenContext = filePath.replace(new RegExp(`${path.extname(filePath)}$`), '').replace(new RegExp(`^${linksDirectory}`), '');
        const result = { url: line, context, tags, hiddenContext, existingLinkIndex, filePath };

        if (linkNote) {
          result.linkNote = linkNote;
        }

        urls.push(result);

        context = '';
        note = [];
      }
    }
  });

  return urls;
}

export default parseLinksTxtFile;
