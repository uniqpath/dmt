import dmt from 'dmt/bridge';

import { detectMediaType } from 'dmt/search';

const { prettyTimeAge, prettyFileSize, log } = dmt;

function enhanceSwarm(result, { swarmGateway }) {
  const { swarmBzzHash } = result;

  const playableUrl = `${swarmGateway}/files/${swarmBzzHash}`;

  const { name, date, mediaType, fileSize } = result;

  if (mediaType) {
    result.mediaType = mediaType;
  }

  if (fileSize) {
    result.fileSizePretty = prettyFileSize(fileSize);
  }

  if (date) {
    try {
      result.prettyTime = prettyTimeAge(new Date(date));
    } catch (e) {
      log.red(`Warning: cannot parse date: ${date}`);
      log.red(result);
    }
  }

  Object.assign(result, { swarmBzzHash, playableUrl });
}

export default enhanceSwarm;
