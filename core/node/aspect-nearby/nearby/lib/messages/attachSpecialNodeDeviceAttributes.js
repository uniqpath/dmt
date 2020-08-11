import dmt from 'dmt/bridge';

export default function attachSpecialNodeDeviceAttributes({ program, msg }) {
  const isSpecialNode = msg.ip == dmt.accessPointIP;
  if (isSpecialNode) {
    msg.isSpecialNode = true;

    msg.networkId = dmt.definedNetworkId();
  }
}
