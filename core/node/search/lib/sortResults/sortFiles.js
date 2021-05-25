import dmt from 'dmt/bridge';
const { util } = dmt;

export default function(results) {
  return results.sort(util.compareKeys('directory', 'fileName'));
}
