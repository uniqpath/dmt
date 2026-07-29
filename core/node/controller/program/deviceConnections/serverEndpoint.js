import { log, mainServer, colors } from 'dmt/common';

export function getEndpointFromDomain(address) {
  if (address.includes('zetaseek.com')) {
    return `wss://${address}/ws`;
  }
}

export function getMainServerEndpoint() {
  const { domain } = mainServer();

  if (domain) {
    return getEndpointFromDomain(domain);
  }

  log.red(`Cannot initiate connection because mainServer does not have ${colors.yellow('domain')} attribute`);
}
