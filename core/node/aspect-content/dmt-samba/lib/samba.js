import fs from 'fs';
import dmt from 'dmt-bridge';
const { log, mountutils } = dmt;

import homedir from 'homedir';

export default function mount({ share, mountpoint, serverIp, writable = false }) {
  const mntPath = `${mountpoint.replace(/^~/, homedir())}/${share}`;

  if (fs.existsSync(mntPath)) {
    const ret = mountutils.isMounted(mntPath, false);

    if (ret.mounted) {
    } else {
      mountutils.mount(
        `//${serverIp}/${share}`,
        mntPath,
        { fstype: 'cifs', fsopts: `credentials=/root/.dmt/user/access_tokens/samba,iocharset=utf8,noexec${writable ? '' : ',ro'}` },
        result => {
          if (result.error) {
            log.error(`Samba mounting error: ${result.error}`);
          } else {
            log.write(`Samba share ${share} mounted`);
          }
        }
      );
    }
  }
}
