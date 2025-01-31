import MessageSender from './messageSender.js';
import verifyUser from './verifyUser.js';
import { store } from './dedupStore.js';

function notify(constructorOptions, ...options) {
  return new MessageSender(constructorOptions).notify(...options);
}

function notifyAll(constructorOptions, ...options) {
  return new MessageSender(constructorOptions).notifyAll(...options);
}

function app(constructorOptions, appName) {
  return new MessageSender(constructorOptions).app(appName);
}

function optionalApp(constructorOptions, appName) {
  return new MessageSender(constructorOptions).optionalApp(appName);
}

function group(constructorOptions, groupName) {
  return new MessageSender(constructorOptions).group(groupName);
}

function user(constructorOptions, user) {
  return new MessageSender(constructorOptions).user(user);
}

function userKey(constructorOptions, userKey) {
  return new MessageSender(constructorOptions).userKey(userKey);
}

function title(constructorOptions, title) {
  return new MessageSender(constructorOptions).title(title);
}

function network(constructorOptions, network) {
  return new MessageSender(constructorOptions).network(network);
}

function url(constructorOptions, url) {
  return new MessageSender(constructorOptions).url(url);
}

function urlTitle(constructorOptions, urlTitle) {
  return new MessageSender(constructorOptions).urlTitle(urlTitle);
}

function omitDeviceName(constructorOptions) {
  return new MessageSender(constructorOptions).omitDeviceName();
}

function omitAppName(constructorOptions) {
  return new MessageSender(constructorOptions).omitAppName();
}

function ttl(constructorOptions) {
  return new MessageSender(constructorOptions).ttl();
}

function bigMessage(constructorOptions) {
  return new MessageSender(constructorOptions).bigMessage();
}

function highPriority(constructorOptions, high) {
  return new MessageSender(constructorOptions).highPriority(high);
}

function enableHtml(constructorOptions, enable) {
  return new MessageSender(constructorOptions).enableHtml(enable);
}

function dedup(constructorOptions, key) {
  return new MessageSender(constructorOptions).dedup(key);
}

export {
  notify,
  notifyAll,
  app,
  optionalApp,
  group,
  title,
  user,
  userKey,
  omitDeviceName,
  omitAppName,
  highPriority,
  enableHtml,
  bigMessage,
  ttl,
  network,
  url,
  urlTitle,
  verifyUser,
  dedup,
  store
};
