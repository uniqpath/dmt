import axios from 'axios';

const APP_LIMITS_MAP = {
  'x-limit-app-limit': 'limit',
  'x-limit-app-remaining': 'remaining',
  'x-limit-app-reset': 'reset'
};

class Transport {
  constructor(client) {
    this.client = client;

    this.instance = axios.create({
      baseURL: `${client.options.host}/${client.options.version}`,
      timeout: 8000
    });
  }

  sendRequest({ method, url, query }) {
    return new Promise((success, reject) => {
      this.instance({
        method,
        url,
        data: query
      })
        .then(response => {
          if (response.data.status != 1) {
            return reject(new Error(`Pushover api returned http 200 status but internal status ${response.data.status}: `));
          }

          for (const i in APP_LIMITS_MAP) {
            if (response.headers[i]) {
              this.client.app[APP_LIMITS_MAP[i]] = response.headers[i];
            }
          }

          success(response.data);
        })
        .catch(error => {
          if (error.response) {
            const { data, status, headers } = error.response;
            return reject(new Error(JSON.stringify({ data, status, headers })));
          }

          if (error.request) {
            const errorData = { msg: 'Timeout or other error when trying to contact pushover servers', error };
            const e = new Error(JSON.stringify(errorData));
            e.request = error.request;
            return reject(e);
          }

          return reject(new Error(`Coding error in pushover api ... should not happen ${error.message}`));
        });
    });
  }
}

export default Transport;
