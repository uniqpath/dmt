const dmt = require('dmt-bridge');
const jayson = require('jayson');

class PlayerRemote {
  constructor({ host, port = dmt.services('rpc').port, mediaType = 'music' }) {
    this.playerClient = jayson.client.http(`http://${host}:${port}`);
    this.mediaType = mediaType;
  }

  async action(command, args) {
    return new Promise((success, reject) => {
      this.playerClient.request(`player/${command}`, Object.assign(args, { mediaType: this.mediaType }), (err, response) => {
        if (err) {
          reject(err);
          return;
        }

        success(response);
      });
    });
  }
}

module.exports = PlayerRemote;
