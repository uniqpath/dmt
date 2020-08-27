import axios from 'axios';

function fetchPeerList() {
  return new Promise((success, reject) => {
    const url = 'https://zetaseek.com/info/';

    const requester = axios.create({
      baseURL: url,
      timeout: 10000
    });

    requester
      .get('peers.txt')
      .then(res =>
        success(
          res.data
            .split('\r')
            .join('')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line != '')
        )
      )
      .catch(reject);
  });
}

export default fetchPeerList;
