import Command from './Command';
import Receipt from '../Receipt';

class GetReceipt extends Command {
  constructor(receipt) {
    super();

    this.receipt = receipt;
  }

  invoke(client) {
    let options = {
      method: 'get',
      url: `/receipts/${this.receipt}.json`,
      query: {
        token: client.apiToken
      }
    };

    return client
      .getTransport()
      .sendRequest(options)
      .then(result => {
        return new Receipt(this.receipt, result);
      });
  }
}

export default GetReceipt;
