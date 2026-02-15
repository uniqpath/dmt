import { log, dmtPath } from 'dmt/common';

import path from 'path';
import fs from 'fs';
import retrace from 'retrace';

export default function handleErrorFromGui(stacktrace) {
  const sourceMapPath = path.join(dmtPath, 'apps/gui/frontend/app/public/bundle.js.map');

  if (fs.existsSync(sourceMapPath)) {
    retrace.register(null, fs.readFileSync(sourceMapPath));

    retrace
      .map(stacktrace)
      .then(mappedStack => {
        log.error(`Gui error in browser: ${mappedStack}`);
      })
      .catch(err => {
        log.cyan(`Something went wrong while trying to map sourcemaps ${err}`);
        log.error(`Original gui error in browser: ${stacktrace}`);
      });
  } else {
    log.error(`Gui error in browser: ${stacktrace}`);
  }
}
