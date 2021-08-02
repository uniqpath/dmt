import { notify, notifyAll } from './notifier';

class MessageSender {
  constructor({ program, isABC, abcNetworkID }) {
    this.program = program;
    this.isABC = isABC;
    this.networkName = abcNetworkID;
  }

  app(app) {
    this._app = app;
    return this;
  }

  group(group) {
    this._group = group;
    return this;
  }

  userKey(userKey) {
    this._userKey = userKey;
    return this;
  }

  title(title) {
    this._title = title;
    return this;
  }

  url(url) {
    this._url = url;
    return this;
  }

  urlTitle(urlTitle) {
    this._urlTitle = urlTitle;
    return this;
  }

  omitDeviceName() {
    this._omitDeviceName = true;
    return this;
  }

  highPriority() {
    this._highPriority = true;
    return this;
  }

  notify(message) {
    const network = this.networkName || this.program?.network.name();

    return notify(message, {
      app: this._app,
      group: this._group,
      title: this._title,
      network,
      omitDeviceName: this._omitDeviceName,
      url: this._url,
      urlTitle: this._urlTitle,
      userKey: this._userKey,
      highPriority: this._highPriority,
      isABC: this.isABC
    });
  }

  notifyAll(message) {
    const network = this.networkName || this.program?.network.name();

    return notifyAll(message, {
      app: this._app,
      title: this._title,
      network,
      omitDeviceName: this._omitDeviceName,
      url: this._url,
      urlTitle: this._urlTitle,
      highPriority: this._highPriority,
      isABC: this.isABC
    });
  }
}

export default MessageSender;
