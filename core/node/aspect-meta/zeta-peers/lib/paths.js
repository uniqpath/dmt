import path from 'path';
import dmt from 'dmt/bridge';

const zetaDeviceMasterPeerlistFilePath = path.join(dmt.deviceDir(), 'web_info/peers.txt');
const peerFilePath = path.join(dmt.dmtHerePath, 'zeta_peers.txt');

export { zetaDeviceMasterPeerlistFilePath, peerFilePath };
