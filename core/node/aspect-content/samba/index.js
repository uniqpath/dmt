import dmt from 'dmt/bridge';

import mapToLocal from './lib/mapToLocal';

import checkServerSambaSharesConfig from './lib/checkServerSambaSharesConfig';
import prepareMountpoints from './lib/prepareMountpoints';
import mount from './lib/mount';

function init(program) {
  if (dmt.isLinux()) {
    checkServerSambaSharesConfig();
    prepareMountpoints().forEach(mountInfo => mount(mountInfo));
  }

  program.mapToLocal = mapToLocal;
}

export { init };
