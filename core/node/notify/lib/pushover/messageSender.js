import { notify, notifyAll } from './notifier';

class MessageSender {
  constructor(program) {
    this.program = program;
  }

  app(app) {
    this._app = app;
    return this;
  }

  group(group) {
    this._group = group;
    return this;
  }

  title(title) {
    this._title = title;
    return this;
  }

  notify(message) {
    const network = this.program?.network.name();
    return notify(message, { app: this._app, group: this._group, title: this._title, network, omitDeviceName: this._omitDeviceName });
  }

  notifyAll(message) {
    const network = this.program?.network.name();
    return notifyAll(message, { app: this._app, title: this._title, network, omitDeviceName: this._omitDeviceName });
  }

  omitDeviceName() {
    this._omitDeviceName = true;
    return this;
  }
}

export default MessageSender;
