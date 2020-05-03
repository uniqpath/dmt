import colors from 'colors';
import fs from 'fs';
import def from './parsers/def/parser';

import cliParser from './parsers/cli/parser';
import parseDeviceMention from './parsers/cli/parseDeviceMention';
import { sambaDefinitionErrorCheck } from './sambaHelpers';

import dmt from './dmtHelper';

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

function readContentDef({ filePath }) {
  try {
    if (!fs.existsSync(filePath)) {
      return def.makeTryable({ empty: true });
    }

    const contentDef = def.parseFile(filePath);

    return def.makeTryable(contentDef);
  } catch (e) {
    console.log(colors.red(e.message));
    process.exit();
  }
}

function getContentIDs() {
  const filePath = dmt.deviceDefFile('this', 'content');
  const contentDef = readContentDef({ filePath });

  return def.values(contentDef.multi).filter(id => id);
}

function contentPaths({ contentId, deviceId = 'this', returnSambaSharesInfo = false }) {
  const device = dmt.device({ deviceId });
  const filePath = dmt.deviceDefFile(deviceId, 'content');
  const contentDef = readContentDef({ filePath });

  if (contentDef.empty) {
    return;
  }

  const content = contentDef.multi.find(c => c.id == contentId);

  if (!content) {
    throw new Error(`@${device.id}/${contentId} is not defined.`);
  }

  sambaDefinitionErrorCheck(content, filePath);

  if (content.sambaShare) {
    if (returnSambaSharesInfo) {
      return { sambaShare: content.sambaShare, sambaPath: content.sambaPath };
    }

    return [content.sambaPath];
  }

  if (content) {
    return def.values(content.path).map(path => dmt.absolutizePath({ path, device }));
  }
}

export { parseDeviceMention, parseContentRefs, getContentIDs, contentPaths };
