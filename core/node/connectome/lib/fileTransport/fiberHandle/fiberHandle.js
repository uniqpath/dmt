import { encode } from './encodePath';

function create({ ip, fileName, directory }) {
  return `${encodeURIComponent(fileName)}?place=${ip}-${encode(directory)}`;
}

export { create };
