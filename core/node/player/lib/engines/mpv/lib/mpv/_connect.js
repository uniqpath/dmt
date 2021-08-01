import IpcInterface from '../ipcInterface/ipcInterface';
import util from '../util';

const connect = {
  connect() {
    return new Promise((success, reject) => {
      util
        .findIPCCommand(this.options)
        .then(({ ipcCommand, mpvVersion }) => {
          return new Promise((success, reject) => {
            this.mpv_arguments.push(`${ipcCommand}=${this.options.socket}`);

            success({ mpvVersion });
          });
        })
        .then(({ mpvVersion }) => {
          this.socket = new IpcInterface(this.options);

          this.socket
            .init()
            .then(() => {
              this.socket.command('observe_property', [0, 'time-pos']);
              this.socket.command('observe_property', [1, 'percent-pos']);

              const handler = () => {
                if (this.observed.filename && !this.observed.pause && this.currentTimePos != null) {
                  this.emit('timeposition', { seconds: this.currentTimePos, percent: this.currentPercentPos });
                }

                this.timepositionListenerId = setTimeout(handler, this.options.time_update * 500);
              };

              handler();

              let id = 2;
              Object.keys(this.observed).forEach(property => {
                if (property in this.observed) {
                  this.observeProperty(property, id);
                  this.observedIDs[id] = property;
                  id += 1;
                }
              });

              this.socket.on('message', message => this.messageHandler(message));

              this.running = true;

              success({ mpvVersion });
            })
            .catch(() => {
              reject(new Error('cannot_connect_to_mpv_process'));
            });
        })
        .catch(() => {
          reject(new Error('mpv_not_available'));
        });
    });
  },
  isRunning() {
    return this.running;
  }
};

export default connect;
