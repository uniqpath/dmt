import * as dmt from '../../dmtHelper.js';

const { colors } = dmt;

function parseDeviceMention(attrData) {
  let host = attrData.name;

  const deviceDefPresent = !dmt.deviceDefIsMissing(host);

  const thisDeviceName = dmt.device().id;

  let thisHost = false;

  if (deviceDefPresent) {
    if (host == 'this' || host == thisDeviceName) {
      host = thisDeviceName;
      thisHost = true;

      if (!thisDeviceName) {
        throw new Error(`Missing device name, probably the device is not selected ${colors.yellow('→ use')} ${colors.green('dev select')}`);
      }
    }
  }

  const data = { host };

  if (dmt.isValidIPv4Address(host)) {
    if (host.startsWith('192.168.')) {
      data.ip = host;
    } else {
      data.globalIp = host;
    }
    data.hostType = 'ip';
  } else if (host.includes('.')) {
    if (host.toLowerCase().endsWith('.eth')) {
      data.hostType = 'ens';
    } else {
      data.hostType = 'dns';
    }
  }

  if (!data.hostType) {
    data.hostType = 'dmt';
  }

  if (attrData.afterSlash) {
    data.contentId = attrData.afterSlash;
  }

  if (attrData.afterColon) {
    data.port = attrData.afterColon;
  }

  const isDmtDefinedDevice = data.hostType == 'dmt';

  if (thisHost) {
    data.ip = 'localhost';
    data.localhost = true;
    data.deviceKey = dmt.keypair().publicKeyHex;
  } else if (isDmtDefinedDevice) {
    if (!data.ip) {
      const ip = dmt.getIp({ deviceName: host });
      if (ip && !ip.error) {
        data.ip = ip;
      }
    }

    if (!data.globalIp) {
      const globalIp = dmt.getGlobalIp({ deviceName: host });
      if (globalIp && !globalIp.error) {
        data.globalIp = globalIp;
      }
    }
  }

  data.address = data.localhost ? 'localhost' : data.ip || data.globalIp;

  if (!data.address && data.hostType == 'dns') {
    data.address = data.host;
  }

  return data;
}

export default parseDeviceMention;
