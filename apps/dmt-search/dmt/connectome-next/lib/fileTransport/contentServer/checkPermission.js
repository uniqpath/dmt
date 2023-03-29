
import { dmtContent, scan } from 'dmt/common';

let permittedPaths;

export default function checkPermission({ directory }) {
  if (!permittedPaths) {
    // don't load this on top because it can crash the process before logger is ready!
    permittedPaths = dmtContent.defaultContentPaths().map(path => scan.absolutizePath(path));
  }
  // we check case sensitive ... there may be issues on macOS because there directories ./A and ./a are the same
  // make sure that on macOS you specify directory in your content.def exactly as it is on the filesystem
  // in linux you are forced to do this anyway by default (there ~/a and ~/A are different directories)
  return permittedPaths.find(path => directory.startsWith(path));
}
