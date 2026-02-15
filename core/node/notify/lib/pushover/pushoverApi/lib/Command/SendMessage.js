import Command from './Command.js';
import Message from '../Message.js';

function removeEmpty(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

class SendMessage extends Command {
  constructor(message) {
    super();

    Message.validateMessage(message);

    this.message = message;
  }

  invoke(client) {
    const options = {
      method: 'post',
      url: '/messages.json',
      query: {
        token: client.apiToken
      }
    };

    if (this.message.user) {
      options.query.user = this.message.user.id;
      options.query.device = this.message.user.device;
    }

    options.query = removeEmpty({
      ...options.query,
      message: this.message.message,
      html: this.message.enableHtml,
      title: this.message.title,
      url: this.message.url,
      url_title: this.message.urlTitle,
      timestamp: this.message.timestamp,
      ttl: this.message.ttl
    });

    if (this.message.priority) {
      options.query = { ...options.query, ...this.message.priority.properties };
    }

    if (this.message.sound) {
      options.query.sound = this.message.sound.name;
    }

    return client
      .getTransport()
      .sendRequest(options)
      .then(result => {
        return result.receipt;
      });
  }
}

export default SendMessage;
