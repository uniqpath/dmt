import colors from 'colors';

import dmt from 'dmt/common';
const { log, def } = dmt;

import { desktop } from 'dmt/notify';

import express from 'express';

class Server {
  constructor(program) {
    this.program = program;

    this.app = express();
  }

  setupRoutes(expressAppSetup) {
    expressAppSetup(this.app);
  }

  listen() {
    const description = '🌐 DMT-SERVER';

    const port = dmt.determineGUIPort();

    if (!port) {
      throw new Error('Gui port is not properly specified! Please specify in services.def');
    }

    this.app
      .listen(port, () => {
        log.cyan('--------------------------------------------------');
        log.cyan(`💡🚀🎸 OPEN DMT IN BROWSER → ${colors.magenta(`http://localhost:${port}`)}`);
        log.cyan('--------------------------------------------------');

        if (dmt.user().disableStartNotification != 'true') {
          desktop.notify('💡 OPEN DMT IN BROWSER', `🚀🎸 http://localhost:${port}`);
        }

        this.program.store('device').update({ actualGuiPort: port }, { announce: false });
      })
      .on('error', () => {
        throw new Error(`Failed to listen at gui port ${port}`);
      });
  }
}

export default Server;
