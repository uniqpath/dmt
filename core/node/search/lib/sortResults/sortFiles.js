import dmt from 'dmt/common';
const { util } = dmt;

export default function(results) {
  return results.sort(util.orderBy('directory', 'fileName'));
}
