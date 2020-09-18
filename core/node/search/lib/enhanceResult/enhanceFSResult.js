import dmt from 'dmt/bridge';

import path from 'path';

import { fiberHandle } from 'dmt/connectome';

import { detectMediaType } from 'dmt/search';

const { log } = dmt;

function enhanceFS(result, { providerAddress, providerKey, providerPort, searchOriginHost }) {
  const { filePath } = result;

  const fileName = path.basename(filePath);
  const directory = path.dirname(filePath);

  const mediaType = detectMediaType(fileName);

  const localFiberHandle = fiberHandle.create({ fileName, directory, ip: 'localhost' });
  const fiberContentURL = `${providerAddress == 'localhost' ? searchOriginHost : providerAddress}/file/${localFiberHandle}`;

  const directoryHandle = fiberHandle.encode(directory);

  const place = `${providerKey}-${directoryHandle}`;
  if (fiberContentURL.length > 2000) {
    log.read(
      `Warning: URL seems to long, limit is 2048 ${result.fiberContentURL}, todo: use better encoding to reduce the file system path size, as well as trim file name if really long?`
    );
  }

  Object.assign(result, { fileName, directory, directoryHandle, place, mediaType, fiberContentURL, playableUrl: `http://${fiberContentURL}` });
}

export default enhanceFS;
