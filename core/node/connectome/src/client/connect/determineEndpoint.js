const browser = typeof window !== 'undefined';

const MAPPING_SERVICE = 'nip.io';

function useDomainInsteadOfLocalIp(host) {
  if (host.startsWith('192.168') || host.startsWith('10.') || host.startsWith('172.')) {
    return `${host}.${MAPPING_SERVICE}`;
  }

  return host;
}

export default function determineEndpoint({ endpoint, host, port }) {
  if (browser && endpoint && endpoint.startsWith('/')) {
    const wsProtocol = window.location.protocol.includes('s') ? 'wss' : 'ws';
    endpoint = `${wsProtocol}://${window.location.host}${endpoint}`;
  }

  if (!endpoint) {
    if (browser) {
      host = useDomainInsteadOfLocalIp(host || window.location.hostname);
      const wsProtocol = window.location.protocol.includes('s') ? 'wss' : 'ws';

      endpoint = `${wsProtocol}://${host}`;

      if (wsProtocol == 'wss') {
        endpoint = `${wsProtocol}://${host}/ws`;
      } else if (port) {
        endpoint = `${endpoint}:${port}`;
      } else if (window.location.port) {
        endpoint = `${endpoint}:${window.location.port}`;
      }
    } else {
      if (!port) {
        throw new Error(`Connectome determineEndpoint: No websocket port provided for ${host}`);
      }
      endpoint = `ws://${host || 'localhost'}:${port}`;
    }
  }

  return endpoint;
}
