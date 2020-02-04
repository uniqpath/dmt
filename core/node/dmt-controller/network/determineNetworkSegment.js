const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const { wifiAccessPointMAC } = require('dmt-bash-exec').platformTools;

function deleteWifiSegmentInfo(program) {
  delete program.sideStore.wifiSegment;
}

function determineNetworkSegment({ program, networkId }) {
  log.debug(`determineNetworkSegment: ${networkId}`, { cat: 'network-detect' });

  wifiAccessPointMAC()
    .then(({ bssid }) => {
      if (!bssid) {
        deleteWifiSegmentInfo(program);
        return;
      }

      log.debug(`Current AP MAC: ${bssid}`, { cat: 'network-detect' });

      try {
        const segment = dmt.networkSegment({ networkId, bssid });

        if (segment) {
          const { networkId, segmentName } = segment;
          const segmentIdent = `${networkId}/${segmentName}`;
          program.sideStore.wifiSegment = segmentIdent;

          log.debug(`Currently on this network segment: ${colors.cyan(segmentIdent)}`, { cat: 'network-detect' });
        } else {
          program.sideStore.wifiSegment = bssid;
        }
      } catch (e) {
        deleteWifiSegmentInfo(program);
        log.red(e.message);
      }
    })
    .catch(() => {
      deleteWifiSegmentInfo(program);
    });
}

module.exports = determineNetworkSegment;
