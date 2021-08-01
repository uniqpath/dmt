import { app, group, title, omitDeviceName, url, urlTitle, highPriority, userKey, notify, notifyAll } from './lib/pushover/index.js';
import * as apn from './lib/apn.js';
import * as desktop from './lib/desktop.js';
import * as email from './lib/email.js';

import dailyNotifier from './lib2/dailyNotifier.js';
import weeklyNotifier from './lib2/weeklyNotifier.js';
import dateNotifier from './lib2/dateNotifier.js';
import trashTakeoutNotifier from './lib2/trashTakeoutNotifier.js';

import { notify as notifyRaw } from './lib/pushover/notifier.js';

let isABC;
let abcNetworkID;

function initABC(networkId) {
  isABC = true;
  abcNetworkID = networkId;
}

const _push = {
  app: appName => app({ isABC, abcNetworkID }, appName),
  group: groupName => group({ isABC, abcNetworkID }, groupName),
  userKey: _userKey => userKey({ isABC, abcNetworkID }, _userKey),
  title: _title => title({ isABC, abcNetworkID }, _title),
  omitDeviceName: () => omitDeviceName({ isABC, abcNetworkID }),
  url: () => url({ isABC, abcNetworkID }),
  urlTitle: () => urlTitle({ isABC, abcNetworkID }),
  highPriority: (high = true) => highPriority({ isABC, abcNetworkID }, high),
  notify: (...options) => notify({ isABC, abcNetworkID }, ...options),
  notifyAll: (...options) => notifyAll({ isABC, abcNetworkID }, ...options),
  notifyRaw,
  initABC
};

export { _push as push, apn, desktop, email, dailyNotifier, weeklyNotifier, dateNotifier, trashTakeoutNotifier };
