import path from 'path';

import { log, scan, colors } from 'dmt/common';

const IGNORED = ['--unused.js', '--disabled.js'];

export default function load(program, dir) {
  const modules = scan.dir(dir, { onlyFiles: true }).filter(file => path.extname(file) == '.js');

  modules
    .filter(m => !IGNORED.find(suffix => m.endsWith(suffix)))
    .forEach(m =>
      import(m).then(mod => {
        if (mod.default) {
          mod.default(program);
        } else if (mod.init) {
          mod.init(program);
        } else {
          log.red(`⚠️  program.load() — ignoring file ${colors.yellow(m)} — does not export ${colors.yellow('default')} or ${colors.yellow('init')} function`);
        }
      })
    );
}
