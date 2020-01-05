const dmt = require('dmt-bridge');
const { log } = dmt;
const colors = require('colors');
const EventEmitter = require('events');

const dgram = require('dgram');

const BROADCAST_ADDR = '255.255.255.255';
const PORT = 27770;

class UdpBus extends EventEmitter {
  constructor() {
    super();

    this.initSocket();
  }

  initSocket() {
    this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    this.socket.on('error', err => {
      log.red(`UDP socket error:\n${err.stack}`);
    });

    this.socket.on('message', (networkMessage, rinfo) => {
      try {
        const obj = JSON.parse(networkMessage.toString());

        if (!obj.ip) {
          obj.ip = rinfo.address;
        }
        this.emit('message', obj);
      } catch (e) {
        log.write(
          `Received an UDP BROADCAST message from: ${colors.cyan(rinfo.address)}:${colors.yellow(rinfo.port)} - ${colors.gray(
            networkMessage.toString()
          )} ${colors.red("But couldn't parse it to JSON")}`
        );
      }
    });

    this.listen();
  }

  listen() {
    this.socket.on('listening', () => {
      this.socket.setBroadcast(true);

      this.emit('listening');
    });

    this.socket.bind(PORT, '0.0.0.0');
  }

  publish(message) {
    return new Promise((success, reject) => {
      const strMsg = typeof message === 'string' ? message : JSON.stringify(message);
      const networkMessage = Buffer.from(strMsg);

      this.socket.send(networkMessage, 0, networkMessage.length, PORT, BROADCAST_ADDR, err => {
        if (err) {
          reject(err);
        } else {
          success();
        }
      });
    });
  }
}

module.exports = UdpBus;
