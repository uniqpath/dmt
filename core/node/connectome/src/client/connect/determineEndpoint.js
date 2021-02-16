const browser = typeof window !== 'undefined';

export default function determineEndpoint({ endpoint, address, port }) {
  if (browser && endpoint && endpoint.startsWith('/')) {
    const wsProtocol = window.location.protocol.includes('s') ? 'wss' : 'ws';
    endpoint = `${wsProtocol}://${window.location.host}${endpoint}`;
  }

  if (!endpoint) {
    if (browser) {
      address = address || window.location.hostname;
      const wsProtocol = window.location.protocol.includes('s') ? 'wss' : 'ws';

      endpoint = `${wsProtocol}://${address}`;

      if (port) {
        endpoint = `${endpoint}:${port}`;
      } else if (window.location.port) {
        endpoint = `${endpoint}:${window.location.port}`;
      }
    } else {
      endpoint = `ws://${address}:${port}`;
    }
  }

  return endpoint;
}
