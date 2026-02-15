import { program } from 'dmt/common';

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';

import Notifier from './notifierClass.js';
import DynamicNotifier from './dynamicNotifier.js';

export default function notifier(notifications, options = {}) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  let notifier;

  if (typeof notifications === 'function') {
    notifier = new DynamicNotifier(notifications, options, decommissionable);
  } else {
    notifier = new Notifier(notifications, options, decommissionable);
  }

  return program.registerNotifier(notifier);
}
