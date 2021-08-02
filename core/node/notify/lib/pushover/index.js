import MessageSender from './messageSender';
import { notifyAll } from './notifier';

function app(program, appName) {
  return new MessageSender(program).app(appName);
}

function title(program, title) {
  return new MessageSender(program).title(title);
}

function omitDeviceName(program) {
  return new MessageSender(program).omitDeviceName();
}

function notify(program, ...options) {
  return new MessageSender(program).notify(...options);
}

export { app, title, omitDeviceName, notify, notifyAll };
