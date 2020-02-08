const net = require('net');
const colors = require('colors');

const events = {
  closeHandler(errorCode) {
    this.mpvPlayer.removeAllListeners('close');
    this.mpvPlayer.removeAllListeners('error');
    this.mpvPlayer.removeAllListeners('message');
    clearTimeout(this.timepositionListenerId);

    this.socket.socket.destroy();

    this.running = false;

    switch (errorCode) {
      case 0:
        this.emit('quit');
        if (this.options.debug || this.options.verbose) {
          console.log('MPV was quit by the user.');
        }
        break;
      case 4:
        if (this.options.auto_restart) {
          if (this.options.debug || this.options.verbose) {
            console.log('MPV Player has crashed, tying to restart');
          }

          this.start()
            .then(() => {
              this.emit('crashed');
              if (this.options.debug || this.options.verbose) {
                console.log('Restarted MPV Player');
              }
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          this.emit('crashed');
          if (this.options.debug || this.options.verbose) {
            console.log('MPV Player has crashed');
          }
        }
        break;
      default:
        if (this.options.debug || this.options.verbose) {
          console.log('MPV player was terminated with an unknown error code: ' + errorCode);
        }
    }
  },
  errorHandler(error) {
    if (this.options.debug) {
      console.log(error);
    }
  },
  messageHandler(message) {
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

module.exports = events;
