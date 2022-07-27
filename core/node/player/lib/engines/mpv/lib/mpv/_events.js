import net from 'net';

import { log, colors } from 'dmt/common';

const events = {
  errorHandler(error) {
    if (this.options.debug) {
      console.log(error);
    }
  },
  messageHandler(message) {
    if (message.name != 'time-pos' && message.name != 'percent-pos' && message.name != 'audio-bitrate') {
      log.debug(colors.yellow(`Received ipc message from mpv: ${JSON.stringify(message, null, 2)}`), { cat: 'mpv-ipc' });
    }

    if ('event' in message) {
      switch (message.event) {
        case 'idle':
          if (this.options.verbose) {
            console.log('Event: idle');
          }

          break;
        case 'playback-restart':
          if (this.options.verbose) {
            console.log('Event: start');
          }
          this.emit('started');
          break;
        case 'pause':
          if (this.options.verbose) {
            console.log('Event: pause');
          }
          this.emit('paused');
          break;
        case 'unpause':
          if (this.options.verbose) {
            console.log('Event: unpause');
          }
          this.emit('resumed');
          break;
        case 'seek':
          if (this.options.verbose) {
            console.log('Event: seek');
          }
          const observeSocket = new net.Socket();
          const seekstarttimepos = this.currentTimePos;
          let timeout = 0;
          new Promise((resolve, reject) => {
            observeSocket.connect({ path: this.options.socket }, () => {
              observeSocket.on('data', data => {
                timeout += 1;
                let messages = data.toString('utf-8').split('\n');
                messages.forEach(message => {
                  if (message.length > 0) {
                    message = JSON.parse(message);
                    if ('event' in message) {
                      if (message.event === 'playback-restart') {
                        resolve({
                          start: seekstarttimepos,
                          end: this.currentTimePos
                        });
                      } else if (message.event === 'tracks-changed') {
                        reject('Track changed after seek');
                      }
                    }
                  }
                });
                if (timeout > 10) {
                  reject('Seek event timeout');
                }
              });
            });
          })
            .then(times => {
              observeSocket.destroy();
              this.emit('seek', times);
            })
            .catch(status => {
              observeSocket.destroy();
              if (this.options.debug) {
                console.log(status);
              }
            });
          break;
        case 'property-change':
          if (message.name === 'time-pos') {
            this.currentTimePos = message.data;
          } else if (message.name === 'percent-pos') {
            this.currentPercentPos = message.data;
          } else {
            this.observed[message.name] = message.data;

            if (message.name == 'filename' && message.data == null) {
              this.emit('stopped');
            }

            this.emit('statuschange', this.observed);
            if (this.options.verbose) {
              console.log('Event: statuschange');
              console.log(`Property change: ${message.name} - ${message.data}`);
            }
          }
          break;
        default:
          break;
      }
    }
  }
};

export default events;
