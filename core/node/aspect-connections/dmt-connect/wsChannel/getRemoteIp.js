export default function getRemoteIp(ws) {
  let remoteIp = ws._socket.remoteAddress;

  if (remoteIp) {
    if (remoteIp.substr(0, 7) == '::ffff:') {
      remoteIp = remoteIp.substr(7);
    }
  }

  return remoteIp == '::1' || remoteIp == '127.0.0.1' ? 'localhost' : remoteIp;
}
