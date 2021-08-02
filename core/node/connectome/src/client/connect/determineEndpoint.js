const browser = typeof window !== 'undefined';

export default function determineEndpoint({ endpoint, host, port }) {
  if (browser && endpoint && endpoint.startsWith('/')) {
    const wsProtocol = window.location.protocol.includes('s') ? 'wss' : 'ws';
    endpoint = `${wsProtocol}://${window.location.host}${endpoint}`;
  }

  if (!endpoint) {
    if (browser) {
      host = host || window.location.hostname;
      const wsProtocol = window.location.protocol.includes('s') ? 'wss' : 'ws';

      endpoint = `${wsProtocol}://${host}`;

      if (port) {
        endpoint = `${endpoint}:${port}`;
      } else if (window.location.port) {
        endpoint = `${endpoint}:${window.location.port}`;
      }
    } else {
      endpoint = `ws://${host || 'localhost'}:${port}`;
    }
  }

  return endpoint;
}
