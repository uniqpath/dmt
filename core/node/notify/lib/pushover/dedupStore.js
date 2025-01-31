import path from 'path';

import { dmtStateDir } from 'dmt/common';
import { SyncStore } from 'dmt/connectome-stores';

const store = new SyncStore(
  {},
  {
    stateFilePath: path.join(dmtStateDir, 'push_messages_dedup.json')
  }
);

store.slot('pushMessages').makeArray();

export { store };
