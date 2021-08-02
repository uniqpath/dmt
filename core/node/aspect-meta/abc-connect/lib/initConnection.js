import dmt from 'dmt/common';

export default function initConnection(ipcClient) {
  const payload = { pid: process.pid };
  ipcClient.emit('init', payload);
}
