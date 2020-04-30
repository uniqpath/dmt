import { encode } from './encodePath';

function create({ ip, port, defaultPort, fileName, directory }) {
  let provider = ip;

  if (port && port != defaultPort) {
    provider = `${ip}:${port}`;
  }

  return `${encodeURIComponent(fileName)}?place=${provider}-${encode(directory)}`;
}

export { create };
