import fs from 'fs';

import { log } from 'dmt/common';

import * as mountutils from './mountutils.js';

export default function mount({ mountPath, sambaServerIp, sambaShare, writable = false }) {
  if (fs.existsSync(mountPath)) {
    const ret = mountutils.isMounted(mountPath, false);

    if (ret.mounted) {
    } else {
      mountutils.mount(
        `//${sambaServerIp}/${sambaShare}`,
        mountPath,
        { fstype: 'cifs', fsopts: `credentials=/root/.dmt/user/access_tokens/samba,iocharset=utf8,noexec${writable ? '' : ',ro'}` },
        result => {
          if (result.error) {
            log.yellow(`⚠️  Samba mounting error: ${result.error}`);
          } else {
            log.write(`sambaShare ${sambaShare} mounted`);
          }
        }
      );
    }
  } else {
    log.red(`Samba mountPath: ${mountPath} doesn't exist`);
  }
}
