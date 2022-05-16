import { log, ipc } from 'dmt/common';

export default function connect(sockFilePath) {
  const client = new ipc();

  return new Promise((success, reject) => {
    client.connect({ path: sockFilePath, timeout: 1000 }, e => {
      if (e) {
        reject(e);
      } else {
        success(client);
      }
    });
  });
}
