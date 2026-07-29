import { log, isMainServer, everyHour, timeutils } from 'dmt/common';

import describeNearTime from './lib2/lib/describeNearTime.js';
import getTimepoint from './lib2/lib/getTimepoint.js';

const { ONE_MINUTE, ONE_DAY } = timeutils;

import {
  app,
  optionalApp,
  group,
  title,
  omitDeviceName,
  omitAppName,
  SOUND,
  url,
  urlTitle,
  highPriority,
  enableHtml,
  user,
  userKey,
  bigMessage,
  ttl,
  dedup,
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
import scheduleNotifier from './lib2/scheduleNotifier.js';

import { notify as notifyRaw } from './lib/pushover/notifier.js';

let isABC;
let abcNetworkID;

function initABC(networkId) {
  isABC = true;
  abcNetworkID = networkId;
}

const opts = { isABC, abcNetworkID };

const _push = {
  app: appName => app(opts, appName),
  optionalApp: appName => optionalApp(opts, appName),
  group: (...groups) => group(opts, groups.length === 1 ? groups[0] : groups),
  groups: (...groups) => group(opts, groups.length === 1 ? groups[0] : groups),
  user: (...users) => user(opts, users.length === 1 ? users[0] : users),
  users: (...users) => user(opts, users.length === 1 ? users[0] : users),
  userKey: (...keys) => userKey(opts, keys.length === 1 ? keys[0] : keys),
  userKeys: (...keys) => userKey(opts, keys.length === 1 ? keys[0] : keys),
  title: _title => title(opts, _title),
  omitAppName: () => omitAppName(),
  omitDeviceName: () => omitDeviceName(opts),
  url: () => url(opts),
  urlTitle: () => urlTitle(opts),
  highPriority: (high = true) => highPriority(opts, high),
  enableHtml: (enable = true) => enableHtml(opts, enable),
  bigMessage: () => bigMessage(opts),
  ttl: _ttl => ttl(opts, _ttl),
  dedup: opts2 => dedup(opts, opts2),
  notify: (...options) => notify(opts, ...options),
  notifyAll: (...options) => notifyAll(opts, ...options),
  notifyRaw,
  initABC
};

function init() {
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

export {
  init,
  _push as push,
  SOUND,
  verifyUser,
  apn,
  desktop,
  notifier,
  dailyNotifier,
  weeklyNotifier,
  dateNotifier,
  holidayNotifier,
  trashTakeoutNotifier,
  scheduleNotifier,
  describeNearTime,
  getTimepoint
};
