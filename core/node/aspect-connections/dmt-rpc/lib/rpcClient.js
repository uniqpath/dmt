import jayson from 'jayson';

import dmt from 'dmt-bridge';

class DmtRemote {
  constructor({ host, port = dmt.services('rpc').port, targetService }) {
    this.dmtClient = jayson.client.http(`http://${host}:${port}`);
    this.targetService = targetService;
  }

  async action(command, args) {
    return new Promise((success, reject) => {
      this.dmtClient.request(`${this.targetService}/${command}`, args, (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        success(response);
      });
    });
  }
}

export default DmtRemote;
