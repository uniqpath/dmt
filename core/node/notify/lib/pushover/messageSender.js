import { program } from 'dmt/common';

import { notify, notifyAll } from './notifier.js';

class MessageSender {
  constructor({ isABC, abcNetworkID }) {
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

  highPriority(high = true) {
    this._highPriority = high;
    return this;
  }

  notify(message) {
    const network = this.networkName || program?.network.name();

    return notify({
      app: this._app,
      group: this._group,
      message,
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
    const network = this.networkName || program?.network.name();

    return notifyAll({
      app: this._app,
      message,
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
}

export default MessageSender;
