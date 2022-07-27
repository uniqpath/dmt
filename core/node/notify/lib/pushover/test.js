import * as push from './index.js';

import { getGroupToken } from './pushoverDef.js';

console.log(getGroupToken({ app: 'kriptosola', group: 'meetups' }));
console.log(getGroupToken({ app: 'dalmatia', group: 'website' }));
console.log(getGroupToken({ app: 'zeta', group: 'website' }));

push
  .app('zeta')
  .group('website')
  .notify('TEST');
