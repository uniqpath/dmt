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

  optionalApp(optionalApp) {
    this._app = optionalApp;
    this._optionalApp = true;
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

  user(user) {
    this._user = user;
    return this;
  }

  users(user) {
    this._user = user;
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

  omitAppName() {
    this._omitAppName = true;
    return this;
  }

  bigMessage() {
    this._bigMessage = true;
    return this;
  }

  highPriority(high = true) {
    this._highPriority = high;
    return this;
  }

  enableHtml(enable = true) {
    this._enableHtml = enable;
    return this;
  }

  notify(message) {
    const network = this.networkName || program?.network.name();

    return notify({
      app: this._app,
      optionalApp: this._optionalApp,
      group: this._group,
      message,
      title: this._title,
      network,
      omitDeviceName: this._omitDeviceName,
      omitAppName: this._omitAppName,
      bigMessage: this._bigMessage,
      url: this._url,
      urlTitle: this._urlTitle,
      user: this._user,
      userKey: this._userKey,
      highPriority: this._highPriority,
      enableHtml: this._enableHtml,
      isABC: this.isABC
    });
  }

  notifyAll(message) {
    const network = this.networkName || program?.network.name();

    return notifyAll({
      app: this._app,
      optionalApp: this._optionalApp,
      message,
      title: this._title,
      network,
      omitDeviceName: this._omitDeviceName,
      omitAppName: this._omitAppName,
      bigMessage: this._bigMessage,
      url: this._url,
      urlTitle: this._urlTitle,
      user: this._user,
      userKey: this._userKey,
      highPriority: this._highPriority,
      enableHtml: this._enableHtml,
      isABC: this.isABC
    });
  }
}

export default MessageSender;
