import dmt from 'dmt/bridge';

import path from 'path';

import { detectMediaType } from 'dmt/search';
import { fiberHandle as makeFiberHandle } from 'dmt/connectome';

const { log } = dmt;

function enhanceResult({ result, providerAddress, providerPort, searchOriginHost }) {
  const fileName = path.basename(result.filePath);
  const directory = path.dirname(result.filePath);

  const mediaType = detectMediaType(fileName);

  const fiberHandle = makeFiberHandle.create({ fileName, directory, ip: providerAddress, port: providerPort, defaultPort: '7780' });

  const localhost = `localhost:${dmt.determineGUIPort()}`;
  const fiberContentURL = `http://${searchOriginHost || localhost}/file/${fiberHandle}`;

  if (fiberContentURL.length > 2000) {
    log.read(
      `Warning: URL seems to long, limit is 2048 ${result.fiberContentURL}, todo: use better encoding to reduce the file system path size, as well as trim file name if really long?`
    );
  }

  Object.assign(result, { mediaType, fiberHandle, fiberContentURL });
}

export default enhanceResult;
