import { app, title, omitDeviceName, url, urlTitle, highPriority, userKey, notify, notifyAll } from './lib/pushover';
import * as apn from './lib/apn';
import * as desktop from './lib/macos';
import * as email from './lib/email';

let program;

function init(_program) {
  program = _program;
}

let isABC;
let abcNetworkID;

function initABC(networkId) {
  isABC = true;
  abcNetworkID = networkId;
}

const _push = {
  app: appName => app({ program, isABC, abcNetworkID }, appName),
  userKey: _userKey => userKey({ program, isABC, abcNetworkID }, _userKey),
  title: _title => title({ program, isABC, abcNetworkID }, _title),
  omitDeviceName: () => omitDeviceName({ program, isABC, abcNetworkID }),
  url: () => url({ program, isABC, abcNetworkID }),
  urlTitle: () => urlTitle({ program, isABC, abcNetworkID }),
  highPriority: () => highPriority({ program, isABC, abcNetworkID }),
  notify: (...options) => notify({ program, isABC, abcNetworkID }, ...options),
  notifyAll: (...options) => notifyAll({ program, isABC, abcNetworkID }, ...options),
  initABC
};

export { init, _push as push, apn, desktop, email };
