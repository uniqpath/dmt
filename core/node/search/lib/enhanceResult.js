import dmt from 'dmt/bridge';

import path from 'path';

import { fiberHandle as makeFiberHandle } from 'dmt/connectome';

import { detectMediaType } from 'dmt/search';

const { prettyMacroTime, log } = dmt;

function enhanceFS(result, { providerAddress, providerPort, searchOriginHost }) {
  const { filePath } = result;

  const fileName = path.basename(filePath);
  const directory = path.dirname(filePath);

  const mediaType = detectMediaType(fileName);

  const fiberHandle = makeFiberHandle.create({ fileName, directory, ip: providerAddress, port: providerPort, defaultPort: '7780' });

  const localhost = `localhost:${dmt.determineGUIPort()}`;
  const fiberContentURL = `http://${searchOriginHost || localhost}/file/${fiberHandle}`;

  if (fiberContentURL.length > 2000) {
    log.read(
      `Warning: URL seems to long, limit is 2048 ${result.fiberContentURL}, todo: use better encoding to reduce the file system path size, as well as trim file name if really long?`
    );
  }

  Object.assign(result, { mediaType, fiberHandle, fiberContentURL, playableUrl: fiberContentURL });
}

function enhanceSwarm(result, { swarmGateway }) {
  const { swarmBzzHash } = result;

  const playableUrl = `${swarmGateway}/bzz:/${swarmBzzHash}`;

  const { name, date } = result;

  const mediaType = detectMediaType(name);

  if (mediaType) {
    result.mediaType = mediaType;
  }

  if (date) {
    try {
      result.prettyTime = prettyMacroTime(new Date(date));
    } catch (e) {
      log.red(`Warning: cannot parse date: ${date}`);
      log.red(result);
    }
  }

  Object.assign(result, { swarmBzzHash, playableUrl });
}

function enhanceResult({ result, providerAddress, providerPort, searchOriginHost }) {
  const { filePath, swarmBzzHash } = result;

  if (filePath) {
    enhanceFS(result, { providerAddress, providerPort, searchOriginHost });
    return;
  }

  if (swarmBzzHash) {
    enhanceSwarm(result, { swarmGateway: 'https://swarm-gateways.net' });
    return;
  }

  log.red('Unknown search result type:');
  log.red(result);
}

export default enhanceResult;
