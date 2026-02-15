export default function initConnection({ ipcClient, program }) {
  const dmtStartedAt = program.slot('device').get('dmtStartedAt');
  const payload = {
    pid: process.pid,
    dmtStartedAt,
    wasSpawnedByABC: program.wasSpawnedByABC(),
    networkId: program.network.name(),
    foreground: program.runningInTerminalForeground()
  };
  ipcClient.emit('init', payload);
}
