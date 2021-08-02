import MessageSender from './messageSender';

function notify(constructorOptions, ...options) {
  return new MessageSender(constructorOptions).notify(...options);
}

function notifyAll(constructorOptions, ...options) {
  return new MessageSender(constructorOptions).notifyAll(...options);
}

function app(constructorOptions, appName) {
  return new MessageSender(constructorOptions).app(appName);
}

function group(constructorOptions, groupName) {
  return new MessageSender(constructorOptions).group(groupName);
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

function highPriority(constructorOptions) {
  return new MessageSender(constructorOptions).highPriority();
}

export { notify, notifyAll, app, group, title, userKey, omitDeviceName, highPriority, network, url, urlTitle };
