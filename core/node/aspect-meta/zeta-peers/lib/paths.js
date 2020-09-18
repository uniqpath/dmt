import path from 'path';
import dmt from 'dmt/bridge';

const zetaDeviceMasterPeerlistFilePath = path.join(dmt.deviceDir(), 'public/peers.txt');
const peerFilePath = path.join(dmt.dmtHerePath, 'zeta_peers.txt');

export { zetaDeviceMasterPeerlistFilePath, peerFilePath };
