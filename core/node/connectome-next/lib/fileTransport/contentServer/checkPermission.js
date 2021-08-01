import { dmtContent, scan } from 'dmt/common';

let permittedPaths;

export default function checkPermission({ directory }) {
  if (!permittedPaths) {
    permittedPaths = dmtContent.defaultContentPaths().map(path => scan.absolutizePath(path));
  }
  return permittedPaths.find(path => directory.startsWith(path));
}
