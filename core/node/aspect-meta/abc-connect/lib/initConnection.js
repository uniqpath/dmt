import dmt from 'dmt/common';

export default function initConnection({ ipcClient, program }) {
  const payload = { pid: process.pid, networkId: program.network.name() };
  ipcClient.emit('init', payload);
}
