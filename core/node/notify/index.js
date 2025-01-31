import { log, isMainServer, everyHour, timeutils } from 'dmt/common';
const { ONE_MINUTE, ONE_DAY } = timeutils;

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
  ttl,
  notify,
  notifyAll,
  verifyUser,
  store
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
  group: (...groups) => group({ isABC, abcNetworkID }, groups.length === 1 ? groups[0] : groups),
  user: (...users) => user({ isABC, abcNetworkID }, users.length === 1 ? users[0] : users),
  users: (...users) => user({ isABC, abcNetworkID }, users.length === 1 ? users[0] : users),
  userKey: (...keys) => userKey({ isABC, abcNetworkID }, keys.length === 1 ? keys[0] : keys),
  title: _title => title({ isABC, abcNetworkID }, _title),
  omitAppName: () => omitAppName(),
  omitDeviceName: () => omitDeviceName({ isABC, abcNetworkID }),
  url: () => url({ isABC, abcNetworkID }),
  urlTitle: () => urlTitle({ isABC, abcNetworkID }),
  highPriority: (high = true) => highPriority({ isABC, abcNetworkID }, high),
  enableHtml: (enable = true) => enableHtml({ isABC, abcNetworkID }, enable),
  bigMessage: () => bigMessage({ isABC, abcNetworkID }),
  ttl: _ttl => ttl({ isABC, abcNetworkID }, _ttl),
  notify: (...options) => notify({ isABC, abcNetworkID }, ...options),
  notifyAll: (...options) => notifyAll({ isABC, abcNetworkID }, ...options),
  notifyRaw,
  initABC
};

function init(program) {
  if (isMainServer()) {
    const slot = store.slot('pushMessages');
    log.cyan('✉️  Deduplicating push messages on main server');

    setTimeout(
      () =>
        everyHour(() => {
          const now = Date.now();
          slot.removeArrayElements(({ timestamp }) => now - timestamp >= ONE_DAY);
        }),
      10 * ONE_MINUTE
    );
  }
}

export { init, _push as push, verifyUser, apn, desktop, notifier, dailyNotifier, weeklyNotifier, dateNotifier, holidayNotifier, trashTakeoutNotifier };
