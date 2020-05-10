import dmt from 'dmt/bridge';

const deviceName = dmt.device({ onlyBasicParsing: true }).id;

export default function backendState() {
  return { deviceName };
}
