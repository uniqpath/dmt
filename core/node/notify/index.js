import { app, title, omitDeviceName, notify, notifyAll } from './lib/pushover';
import * as apn from './lib/apn';
import * as desktop from './lib/macos';
import * as email from './lib/email';

let program;

function init(_program) {
  program = _program;
}

const _push = {
  app: appName => app(program, appName),
  title: _title => title(program, _title),
  omitDeviceName: () => omitDeviceName(program),
  notify: (...options) => notify(program, ...options),
  notifyAll: (...options) => notifyAll(program, ...options)
};

export { init, _push as push, apn, desktop, email };
