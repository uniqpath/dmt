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

function parseLinksTxtFile({ filePath, lines, existingLinkIndex }) {
  const urls = [];

  let context = '';
  let note = [];

  let isInsideNote = false;

  lines.forEach((line, index) => {
    line = trimAndRemoveComments(line);

    if (!emptyLine(line)) {
      if (!isLink(line) && !tripleDashComment(line) && !isInsideNote) {
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

      if (isLink(line)) {
        const linkNote = note.join('\n');

        const result = { url: line, context, existingLinkIndex, filePath, githubLineNum: index + 1 };

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
