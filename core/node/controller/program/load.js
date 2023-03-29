import fs from 'fs';
import path from 'path';

import { log, scan, colors } from 'dmt/common';

const IGNORED = ['--unused', '--disabled', '--ignore', '--ignored'];
const NOT_LOADABLE_DIRS = ['lib', 'helpers', '_lib', '_helpers'];

function isNonLoadablePath(filePath) {
  const dirName = path.dirname(filePath);

  const basedir = dirName.split(path.sep).pop();

  return NOT_LOADABLE_DIRS.includes(basedir);
}

export default function load(program, dir, filter = () => true, recursive = false) {
  if (fs.existsSync(dir)) {
    const modules = recursive ? scan.recursive(dir, { flatten: true }).map(({ path }) => path) : scan.dir(dir, { onlyFiles: true });

    modules
      .filter(m => !isNonLoadablePath(m))
      .filter(file => path.extname(file) == '.js')
      .filter(m => !IGNORED.some(keyword => m.match(new RegExp(`${keyword}(?!\\w)`))))
      .filter(m => filter(m))
      .forEach(m =>
        import(`${m}?cacheInvalidate=${Date.now()}`)
          .then(mod => {
            if (mod.default) {
              mod.default(program);
            } else if (mod.init) {
              mod.init(program);
            } else {
              log.red(
                `⚠️  program.load() — ignoring file ${colors.yellow(m)} — does not export ${colors.yellow('default')} or ${colors.yellow('init')} function`
              );
            }
          })
          .catch(error => {
            throw new Error(`Dynamically loading module ${colors.yellow(m)}: ${error.stack || error}`);
          })
      );
  }
}
