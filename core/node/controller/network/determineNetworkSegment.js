import colors from 'colors';

import dmt from 'dmt/common';
const { log } = dmt;

import { platformTools } from 'dmt/bash-exec';
const { wifiAccessPointMAC } = platformTools;

export default determineNetworkSegment;

function deleteWifiSegmentInfo(program) {
  delete program.sideStore.wifiSegment;
}

function determineNetworkSegment({ program, networkId }) {
  log.debug(`determineNetworkSegment: ${networkId}`, { cat: 'network-detect' });

  wifiAccessPointMAC()
    .then(({ bssid }) => {
      program.store.update({ device: { apssid: bssid } });

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
