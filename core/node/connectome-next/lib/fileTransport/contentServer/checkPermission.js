import dmt from 'dmt/common';
const { dmtContent, scan } = dmt;

let permittedPaths;

export default function checkPermission({ directory }) {
  if (!permittedPaths) {
    permittedPaths = dmtContent.defaultContentPaths().map(path => scan.absolutizePath(path));
  }
  return permittedPaths.find(path => directory.startsWith(path));
}
