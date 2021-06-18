import fs from 'fs';

import { push } from 'dmt/notify';

import dmt from 'dmt/common';

const { log, textfileParsers, dmtContent } = dmt;

const { sambaConfigParser } = textfileParsers;

export default function checkServerSambaSharesConfig() {
  const sambaConfigFile = '/etc/samba/smb.conf';

  for (const contentId of dmtContent.getContentIDs()) {
    const content = dmtContent.contentPaths({ contentId, returnSambaSharesInfo: true });

    if (content.sambaShare) {
      if (!fs.existsSync(sambaConfigFile)) {
        const msg = `⚠️ ⚠️ ⚠️  there are sambaShares defined in content.def but ${sambaConfigFile} file is missing`;
        log.red(msg);
        push.notify(`${dmt.device().id}: ${msg}`);
        return;
      }

      const sambaPath = sambaConfigParser({ content: fs.readFileSync(sambaConfigFile).toString(), section: content.sambaShare, keys: 'path' }).path;

      if (sambaPath != content.sambaPath) {
        const ident = `content.def content:${contentId}`;
        const msg = `⚠️ ⚠️ ⚠️  ${ident} sambaPath (${content.sambaPath}) is different than path defined in ${sambaConfigFile} (${sambaPath}) for share [${content.sambaShare}]`;
        log.red(msg);
        push.notify(`${dmt.device().id}: ${msg}`);
      }
    }
  }
}
