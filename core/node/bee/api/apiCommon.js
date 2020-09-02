import axios from 'axios';

function createRequester({ port }) {
  const base = `http://localhost:${port}`;

  const requester = axios.create({
    baseURL: base,
    timeout: 1000
  });

  return requester;
}

function simpleGetRequest(endpoint, requester) {
  return new Promise((success, reject) => {
    requester
      .get(endpoint)
      .then(res => success(res.data))
      .catch(e => reject(e.code));
  });
}

export { createRequester, simpleGetRequest };
