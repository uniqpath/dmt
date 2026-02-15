function removeEmpty(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

export function sendMessageOptions({ message, client }) {
  const options = {
    method: 'post',
    url: '/messages.json',
    query: {
      token: client.apiToken
    }
  };

  if (message.user) {
    options.query.user = message.user.id;
    options.query.device = message.user.device;
  }

  options.query = removeEmpty({
    ...options.query,
    message: message.message,
    html: message.enableHtml,
    title: message.title,
    url: message.url,
    url_title: message.urlTitle,
    timestamp: message.timestamp,
    ttl: message.ttl,
    priority: message.priority,
    sound: message.sound
  });

  return options;
}

export function sendMessage({ message, client }) {
  return client
    .getTransport()
    .sendRequest(sendMessageOptions({ message, client }))
    .then(result => {
      return result.receipt;
    });
}
