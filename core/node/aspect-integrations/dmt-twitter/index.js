import dmt from 'dmt-bridge';
const { util, def, log } = dmt;

import Twitter from 'twitter';
import favoriteTweets from './lib/favoriteTweets.js';
const tokens = dmt.accessTokens('twitter');

const refreshInterval = 15 * 60 * 1000;

function refresh({ program, client }) {
  try {
    const updatedAt = def.tryOnTheFly(program.state, 'integrations.twitter.favoriteTweets.updatedAt');
    if (!updatedAt || Date.now() - updatedAt >= refreshInterval) {
      favoriteTweets({ program, client });
    }
  } catch (e) {
    log.red(e);
  }
}

function init(program) {
  if (!tokens) {
    return;
  }

  const client = new Twitter(util.snakeCaseKeys(tokens));
  util.periodicRepeat(() => refresh({ program, client }), refreshInterval);
}

export default { init };
