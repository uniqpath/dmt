import dmt from 'dmt/common';

function attachVersionInfo(device) {
  return { ...device, versionCompareSymbol: dmt.versionCompareSymbol(device.dmtVersion) };
}

export default function deriveDeviceData(device) {
  return attachVersionInfo(device);
}
