import dmt from 'dmt/common';
const { log } = dmt;

export default function connect(sockFilePath) {
  const client = new dmt.ipc();

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
