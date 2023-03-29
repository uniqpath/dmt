import {
  app,
  optionalApp,
  group,
  title,
  omitDeviceName,
  omitAppName,
  url,
  urlTitle,
  highPriority,
  enableHtml,
  user,
  userKey,
  bigMessage,
  notify,
  notifyAll
} from './lib/pushover/index.js';
import * as apn from './lib/apn.js';
import * as desktop from './lib/desktop.js';
import notifier from './lib2/notifier.js';
import dailyNotifier from './lib2/dailyNotifier.js';
import weeklyNotifier from './lib2/weeklyNotifier.js';
import dateNotifier from './lib2/dateNotifier.js';
import holidayNotifier from './lib2/holidayNotifier.js';
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
  optionalApp: appName => optionalApp({ isABC, abcNetworkID }, appName),
  group: groupName => group({ isABC, abcNetworkID }, groupName),
  user: _user => user({ isABC, abcNetworkID }, _user),
  users: _user => user({ isABC, abcNetworkID }, _user),
  userKey: _userKey => userKey({ isABC, abcNetworkID }, _userKey),
  title: _title => title({ isABC, abcNetworkID }, _title),
  omitAppName: () => omitAppName(),
  omitDeviceName: () => omitDeviceName({ isABC, abcNetworkID }),
  url: () => url({ isABC, abcNetworkID }),
  urlTitle: () => urlTitle({ isABC, abcNetworkID }),
  highPriority: (high = true) => highPriority({ isABC, abcNetworkID }, high),
  enableHtml: (enable = true) => enableHtml({ isABC, abcNetworkID }, enable),
  bigMessage: () => bigMessage({ isABC, abcNetworkID }),
  notify: (...options) => notify({ isABC, abcNetworkID }, ...options),
  notifyAll: (...options) => notifyAll({ isABC, abcNetworkID }, ...options),
  notifyRaw,
  initABC
};

export { _push as push, apn, desktop, notifier, dailyNotifier, weeklyNotifier, dateNotifier, holidayNotifier, trashTakeoutNotifier };
