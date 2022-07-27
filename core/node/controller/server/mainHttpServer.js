import { log, def, colors, user, determineGUIPort } from 'dmt/common';

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

    const port = determineGUIPort();

    if (!port) {
      throw new Error('Gui port is not properly specified! Please specify in services.def');
    }

    this.app
      .listen(port, () => {
        log.cyan('--------------------------------------------------');
        log.cyan(`💡🚀🎸 OPEN DMT IN BROWSER → ${colors.magenta(`http://localhost:${port}`)}`);
        log.cyan('--------------------------------------------------');

        //   desktop.notify(`🚀🎸 http://localhost:${port}`, 'OPEN DMT IN BROWSER');
        this.program.slot('device').update({ actualGuiPort: port }, { announce: false });
      })
      .on('error', () => {
        throw new Error(`Failed to listen at gui port ${port}`);
      });
  }
}

export default Server;
