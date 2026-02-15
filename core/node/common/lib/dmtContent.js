import fs from 'fs';
import def from './parsers/def/parser.js';

import cliParser from './parsers/cli/parser.js';
import parseDeviceMention from './parsers/cli/parseDeviceMention.js';
import sambaDefinitionErrorCheck from './sambaDefinitionErrorCheck.js';

import { log, deviceDefFile, device as _device, absolutizePath } from './dmtHelper.js';

function parseContentRefs(contentRefs) {
  contentRefs = contentRefs.map(contentRef => {
    if (contentRef.includes('/')) {
      return contentRef;
    }

    if (contentRef.startsWith('@')) {
      return contentRef;
    }

    return `@this/${contentRef}`;
  });

  return cliParser(contentRefs).map(parsed => parseDeviceMention(parsed));
}

function localDefaultContent() {
  return parseDeviceMention(cliParser(['@this'])[0]);
}

function readContentDef({ filePath }) {
  try {
    if (!fs.existsSync(filePath)) {
      return def.makeTryable({ empty: true });
    }

    const contentDef = def.parseFile(filePath);

    return def.makeTryable(contentDef);
  } catch (e) {
    log.red(`content.def: ${e.message}`);
    process.exit();
  }
}

function getContentIDs() {
  const filePath = deviceDefFile('this', 'content');
  const contentDef = readContentDef({ filePath });

  return def.values(contentDef.multi).filter(id => id);
}

function contentPaths({ contentId, deviceName = 'this', returnSambaSharesInfo = false }) {
  const device = _device({ deviceName });
  const filePath = deviceDefFile(deviceName, 'content');
  const contentDef = readContentDef({ filePath });

  if (contentDef.empty) {
    return [];
  }

  const content = contentDef.multi.find(c => c.id == contentId);

  if (!content) {
    return [];
  }

  sambaDefinitionErrorCheck(content, filePath);

  if (content.sambaShare) {
    if (returnSambaSharesInfo) {
      return { sambaShare: content.sambaShare, sambaPath: content.sambaPath };
    }

    return [content.sambaPath];
  }

  if (content) {
    return def.values(content.path).map(path => absolutizePath({ path, device }));
  }
}

function defaultContentPaths() {
  return contentPaths({ contentId: undefined });
}

export { parseDeviceMention, localDefaultContent, parseContentRefs, getContentIDs, contentPaths, defaultContentPaths };
