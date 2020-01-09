import dmt from 'dmt-bridge';
const { log, def, util } = dmt;

function mapTweet(tweet) {
  const { user } = tweet;

  return {
    url: `https://twitter.com/${user.screen_name}/status/${tweet.id_str}`,
    text: tweet.full_text || tweet.text,
    userName: user.name,
    userHandle: `@${user.screen_name}`,
    photoUrl: user.profile_image_url_https
  };
}

function addTweet({ program, tweet }) {
  const tweets = def.tryOnTheFly(program.state, 'integrations.twitter.favoriteTweets.data') || [];

  const max = 20;

  const favoriteTweets = { updatedAt: Date.now(), data: [mapTweet(tweet), ...tweets].slice(0, max) };

  program.updateIntegrationsState({ twitter: { favoriteTweets } });
}

function tweets({ program, client }) {
  const stream = client.stream('statuses/filter', { track: 'ethereum', tweet_mode: 'extended' });

  stream.on('data', event => {
    addTweet({ program, tweet: event });
  });

  stream.on('error', error => {
    log.red(error);
    log.debug(`Twitter stream api error: ${JSON.stringify(error, null, 2)}`);
  });
}

export default tweets;
