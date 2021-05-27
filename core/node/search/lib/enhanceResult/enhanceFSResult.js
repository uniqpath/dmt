import path from 'path';
import dmt from 'dmt/bridge';

import { fiberHandle } from 'dmt/connectome-next';

const { log } = dmt;

function enhanceFS(result, { providerAddress, providerKey, providerPort, searchOriginHost }) {
  const { fileName, directory } = result;

  const basedir = path.basename(directory);
  const extname = path.extname(fileName).replace(/^\./, '');

  const localFiberHandle = fiberHandle.create({ fileName, directory, ip: 'localhost' });
  const fiberContentURL = `${providerAddress == 'localhost' ? searchOriginHost : providerAddress}/file/${localFiberHandle}`;

  const directoryHandle = fiberHandle.encode(directory);

  const place = `${providerKey}-${directoryHandle}`;
  if (fiberContentURL.length > 2000) {
    log.read(
      `Warning: URL seems to long, limit is 2048 ${result.fiberContentURL}, todo: use better encoding to reduce the file system path size, as well as trim file name if really long?`
    );
  }

  Object.assign(result, { directoryHandle, basedir, extname, place, fiberContentURL, playableUrl: `http://${fiberContentURL}` });
}

export default enhanceFS;
