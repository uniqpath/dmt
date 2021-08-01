import Command from './Command.js';

class CancelEmergency extends Command {
  constructor(receipt) {
    super();

    this.receipt = receipt;
  }

  invoke(client) {
    const options = {
      method: 'post',
      url: `/receipts/${this.receipt}/cancel.json`,
      query: {
        token: client.apiToken
      }
    };

    return client
      .getTransport()
      .sendRequest(options)
      .then(result => {
        return result.status ? true : false;
      });
  }
}

export default CancelEmergency;
