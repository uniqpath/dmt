import dmt from 'dmt/bridge';

const { util } = dmt;

const WELL_KNOWN_DOMAINS = {
  github: '.com',
  medium: '.com',
  twitter: '.com',
  youtube: ['.com', 'youtu.be'],
  discord: ['.com', '.gg'],
  coingecko: '.com',
  'google-docs': 'docs.google.com',
  substack: '.com',
  wikipedia: '.org',
  reddit: '.com',
  hackmd: '.io',
  etherscan: '.io',
  swarm: 'gateway.ethswarm.org',
  'swarm-staging': 'gateway.staging.ethswarm.org'
};

let cache;
function wellKnownDomains() {
  if (!cache) {
    cache = Object.entries(WELL_KNOWN_DOMAINS)
      .map(([hostTag, _mappings]) => {
        return util.listify(_mappings).map(mapping => {
          if (mapping.startsWith('.')) {
            return [`${hostTag}${mapping}`, hostTag];
          }

          return [mapping, hostTag];
        });
      })
      .flat();
  }

  return cache;
}

function matchHost(host) {
  for (const [suffix, hostTag] of wellKnownDomains()) {
    if (host.match(new RegExp(`^${suffix}$`)) || host.match(new RegExp(`\\.${suffix}$`))) {
      return hostTag;
    }
  }
}

export { wellKnownDomains, matchHost };
