import { program } from 'dmt/common';

import { notify, notifyAll } from './notifier.js';

export default class MessageSender {
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

  group(...group) {
    this._group = group.flat().filter(Boolean);
    return this;
  }

  groups(...group) {
    return this.group(...group);
  }

  user(...user) {
    this._user = user.flat().filter(Boolean);
    return this;
  }

  users(...user) {
    return this.user(...user);
  }

  userKey(...userKey) {
    this._userKey = userKey.flat().filter(Boolean);
    return this;
  }

  userKeys(...userKey) {
    return this.userKey(...userKey);
  }

  title(title) {
    this._title = title;
    return this;
  }

  sound(sound) {
    this._sound = sound;
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

  ttl(ttl) {
    this._ttl = ttl;
    return this;
  }

  highPriority(high = true) {
    this._highPriority = high;
    return this;
  }

  lowPriority(low = true) {
    this._lowPriority = low;
    return this;
  }

  enableHtml(enable = true) {
    this._enableHtml = enable;
    return this;
  }

  dedup({ dedupKey, preHash }) {
    this._dedupKey = dedupKey;
    this._preHash = preHash;
    return this;
  }

  getArgs(opts = {}) {
    return {
      ...opts,
      app: this._app,
      optionalApp: this._optionalApp,
      group: this._group,
      title: this._title,
      omitDeviceName: this._omitDeviceName,
      omitAppName: this._omitAppName,
      bigMessage: this._bigMessage,
      url: this._url,
      urlTitle: this._urlTitle,
      ttl: this._ttl,
      user: this._user,
      userKey: this._userKey,
      sound: this._sound,
      highPriority: this._highPriority,
      lowPriority: this._lowPriority,
      enableHtml: this._enableHtml,
      dedupKey: this._dedupKey,
      preHash: this._preHash,
      isABC: this.isABC
    };
  }

  notify(message) {
    const network = this.networkName || program?.network.name();
    return notify(this.getArgs({ message, network }));
  }

  notifyAll(message) {
    const network = this.networkName || program?.network.name();
    return notifyAll(this.getArgs({ message, network }));
  }
}
