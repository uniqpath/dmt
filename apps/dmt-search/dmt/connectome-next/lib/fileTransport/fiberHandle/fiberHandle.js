import { encode, decode } from './encodePath.js';

function create({ ip, port, defaultPort, fileName, directory }) {
  let provider = ip;

  if (port && port != defaultPort) {
    provider = `${ip}:${port}`;
  }

  return `${encodeURIComponent(fileName)}?place=${provider}-${encode(directory)}`;
}

export { create, encode, decode };

//console.log(encodeURI('1-Portrait of &#39;Night-Shining White&#39;, a favorite steed of Emperor Xuanzong.jpg'));
