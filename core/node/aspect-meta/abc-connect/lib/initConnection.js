export default function initConnection({ ipcClient, program }) {
  const payload = { pid: process.pid, networkId: program.network.name(), foreground: program.runningInTerminalForeground() };
  ipcClient.emit('init', payload);
}
