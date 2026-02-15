import { log, ipc } from 'dmt/common';

export default function connect(sockFilePath, { timeout }) {
  const client = new ipc();

  return new Promise((success, reject) => {
    client.connect({ path: sockFilePath, timeout }, e => {
      if (e) {
        reject(e);
      } else {
        success(client);
      }
    });
  });
}
