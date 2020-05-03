import colors from 'colors';
import dmt from '../../dmtHelper';

function isValidIPv4Address(ipaddress) {
  if (
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress
    )
  ) {
    return true;
  }

  return false;
}

function parseDeviceMention(attrData) {
  let host = attrData.name;

  const deviceDefPresent = !dmt.deviceDefIsMissing(host);

  const thisDeviceId = dmt.device().id;

  let thisHost = false;

  if (deviceDefPresent) {
    if (host == 'this' || host == thisDeviceId) {
      host = thisDeviceId;
      thisHost = true;

      if (!thisDeviceId) {
        throw new Error(`Missing device name, probably the device is not selected ${colors.yellow('→ use')} ${colors.green('dev select')}`);
      }
    }
  }

  const data = { host };

  if (isValidIPv4Address(host)) {
    if (host.startsWith('192.168.')) {
      data.ip = host;
    } else {
      data.globalIp = host;
    }
  } else if (host.includes('.')) {
    if (host.toLowerCase().endsWith('.eth')) {
      data.hostType = 'ens';
    } else {
      data.hostType = 'dns';
    }
  }

  if (deviceDefPresent && !data.hostType && dmt.device({ deviceId: host }).id) {
    data.hostType = 'dmt';
  }

  if (attrData.afterSlash) {
    data.contentRef = attrData.afterSlash;
  }

  if (attrData.afterColon) {
    data.port = attrData.afterColon;
  }

  const isDmtDefinedDevice = data.hostType == 'dmt';

  if (thisHost) {
    data.ip = 'localhost';
    data.localhost = true;
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

  data.address = data.localhost ? 'localhost' : data.ip || data.globalIp || data.host;

  return data;
}

export default parseDeviceMention;
