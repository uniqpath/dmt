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

function tweets({ program, client }) {
  client.get('statuses/home_timeline', { tweet_mode: 'extended' }, (error, tweets, response) => {
    if (error) {
      log.debug(`Twitter api error: ${JSON.stringify(error, null, 2)}`);
      return;
    }

    const favoriteTweets = { updatedAt: Date.now(), data: tweets.map(mapTweet) };

    program.updateIntegrationsState({ twitter: { favoriteTweets } });
  });
}

export default tweets;
