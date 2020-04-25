import { encode } from './encodePath';

function create({ ip, fileName, directory }) {
  return `${encodeURI(fileName)}?place=${ip}-${encode(directory)}`;
}

export { create };
