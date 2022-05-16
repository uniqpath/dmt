import { versionCompareSymbol } from 'dmt/common';

function attachVersionInfo(device) {
  return { ...device, versionCompareSymbol: versionCompareSymbol(device.dmtVersion) };
}

export default function deriveDeviceData(device) {
  return attachVersionInfo(device);
}
