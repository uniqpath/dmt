import dmt from 'dmt/bridge';

import checkServerSambaSharesConfig from './lib/checkServerSambaSharesConfig';
import prepareMountpoints from './lib/prepareMountpoints';
import mount from './lib/mount';

function init() {
  if (dmt.isLinux()) {
    checkServerSambaSharesConfig();
    prepareMountpoints().forEach(mountInfo => mount(mountInfo));
  }
}

export { init };
