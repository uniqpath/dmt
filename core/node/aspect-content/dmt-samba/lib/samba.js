const fs = require('fs');
const dmt = require('dmt-bridge');
const { log, mountutils } = dmt;

const homedir = require('homedir');

function mount({ share, mountpoint, serverIp, writable = false }) {
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

module.exports = mount;

if (require.main === module) {
}
