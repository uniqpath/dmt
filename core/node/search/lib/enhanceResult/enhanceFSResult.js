import dmt from 'dmt/bridge';

import path from 'path';

import { fiberHandle as makeFiberHandle } from 'dmt/connectome';

import { detectMediaType } from 'dmt/search';

const { log } = dmt;

function enhanceFS(result, { providerAddress, providerPort, searchOriginHost }) {
  const { filePath } = result;

  const fileName = path.basename(filePath);
  const directory = path.dirname(filePath);

  const mediaType = detectMediaType(fileName);

  const localFiberHandle = makeFiberHandle.create({ fileName, directory, ip: 'localhost' });
  const fiberContentURL = `${providerAddress == 'localhost' ? searchOriginHost : providerAddress}/file/${localFiberHandle}`;
  if (fiberContentURL.length > 2000) {
    log.read(
      `Warning: URL seems to long, limit is 2048 ${result.fiberContentURL}, todo: use better encoding to reduce the file system path size, as well as trim file name if really long?`
    );
  }

  Object.assign(result, { mediaType, fiberContentURL, playableUrl: `http://${fiberContentURL}` });
}

export default enhanceFS;
