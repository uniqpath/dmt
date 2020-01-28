const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const { wifiAccessPointMAC } = require('dmt-bash-exec').platformTools;

function determineNetworkSegment({ program, networkId }) {
  wifiAccessPointMAC()
    .then(({ bssid }) => {
      try {
        const segment = dmt.networkSegment({ networkId, bssid });

        if (segment) {
          const { networkId, segmentName } = segment;
          const segmentIdent = `${networkId}/${segmentName}`;
          program.sideStore.wifiSegment = segmentIdent;
        } else {
          delete program.sideStore.wifiSegment;
        }
      } catch (e) {
        log.red(e.message);
      }
    })
    .catch(() => {});
}

module.exports = determineNetworkSegment;
