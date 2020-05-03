import dmt from 'dmt/bridge';

import { detectMediaType } from 'dmt/search';

const { prettyMacroTime, log } = dmt;

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

export default enhanceSwarm;
