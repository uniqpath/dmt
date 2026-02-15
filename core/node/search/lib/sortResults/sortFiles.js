import { util } from 'dmt/common';

export default function(results) {
  return results.sort(util.orderBy('directory', 'fileName'));
}
