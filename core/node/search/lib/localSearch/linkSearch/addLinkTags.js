function addLinkTags(entry) {
  const { url } = entry;
  const { host } = new URL(url);

  const linkTags = [];

  if (host.endsWith('github.com')) {
    linkTags.push('github');
  }

  if (host.endsWith('swarm-gateways.net')) {
    linkTags.push('swarm-legacy');
  }

  if (host.endsWith('gateway.ethswarm.org')) {
    linkTags.push('swarm');
  }

  if (host.endsWith('gateway.staging.ethswarm.org')) {
    linkTags.push('swarm-staging');
  }

  if (host.endsWith('medium.com')) {
    linkTags.push('medium');
  }

  if (host.endsWith('hackmd.io')) {
    linkTags.push('hackmd');
  }

  if (host.endsWith('reddit.com')) {
    linkTags.push('reddit');
  }

  if (host.endsWith('wikipedia.org')) {
    linkTags.push('wikipedia');
  }

  if (host.endsWith('youtube.com')) {
    linkTags.push('youtube');
  }

  if (host.endsWith('etherscan.io')) {
    linkTags.push('etherscan');
  }

  if (host.endsWith('substack.com')) {
    linkTags.push('substack');
  }

  if (host.endsWith('coingecko.com')) {
    linkTags.push('coingecko');
  }

  if (host.endsWith('twitter.com')) {
    linkTags.push('twitter');
  }

  if (host.endsWith('discord.com') || host.endsWith('discord.gg')) {
    linkTags.push('discord');
  }

  Object.assign(entry, { linkTags });

  return entry;
}

export default addLinkTags;
