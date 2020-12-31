import dmt from 'dmt/bridge';
const { dmtContent, scan } = dmt;

const permittedPaths = dmtContent.defaultContentPaths().map(path => scan.absolutizePath(path));

export default function checkPermission({ directory }) {
  return permittedPaths.find(path => directory.startsWith(path));
}
