import dmt from 'dmt/bridge';

export default function devices() {
  //return dmt.devices().map(({ _coredata }) => _coredata);
  return [
    { deviceDir: 'fpanel', deviceName: 'fpanel', connect: ['lab', 'lan_server', 'example.com'] },
    { deviceDir: 'gpanel', deviceName: 'gpanel' },
    { deviceDir: 'lab', deviceName: 'lab', connect: ['lan_server', 'server'] },
    { deviceDir: 'lan_server', deviceName: 'lan_server', connect: ['server', 'example.com'] },
    { deviceDir: 'server', deviceName: 'server', connect: ['hidden_planet.space', 'santafe.org'] }
  ];
}
