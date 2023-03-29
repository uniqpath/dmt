import fs from 'fs';
import path from 'path';

import { log, scan, colors } from 'dmt/common';

const IGNORED = ['--unused.js', '--disabled.js'];

export default function load(program, dir, filter = () => true, recursive = false) {
  if (fs.existsSync(dir)) {
    const modules = recursive ? scan.recursive(dir, { flatten: true }).map(({ path }) => path) : scan.dir(dir, { onlyFiles: true });

    modules
      .filter(file => path.extname(file) == '.js')
      .filter(m => !IGNORED.find(suffix => m.endsWith(suffix)))
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
            throw new Error(`Dynamically loading module ${colors.yellow(m)}: ${error}`);
          })
      );
  }
}
