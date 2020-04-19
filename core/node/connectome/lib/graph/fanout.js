import EventEmitter from '../emitter';
import connect from '../connect/connectNode';

class Fanout extends EventEmitter {
  constructor({ addressList, port, protocol, protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose = false } = {}) {
    super();

    this.state = {};

    this.addressList = addressList;
    this.opts = { port, protocol, protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose };

    for (const address of addressList) {
      this.state[address] = {};
    }

    this.connectors = [];

    process.nextTick(() => {
      this.reportState();
    });
  }

  connect() {
    return new Promise(success => {
      Promise.all(this.addressList.map(address => this.connectAddress({ address, ...this.opts }))).then(connectors => success(connectors));
    });
  }

  connectAddress({ address, port, protocol, protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose }) {
    console.log(`CONNECTING ADDRESS ${address}`);
    return new Promise(success => {
      connect({ address, port, protocol, protocolLane, clientPrivateKey, clientPublicKey, clientInitData, verbose }).then(connector => {
        this.connectors.push(connector);

        connector.on('connected', ({ sharedSecret, sharedSecretHex }) => {
          this.state[address].connected = true;

          this.reportState();

          this.emit('connector_connected', connector);
          console.log(`OutFiber ${protocol}/${protocolLane} ${address} connected`);
        });

        connector.on('disconnected', () => {
          this.state[address].connected = false;
          this.reportState();
          console.log(`OutFiber ${protocol}/${protocolLane} ${address} disconnected`);
        });

        success(connector);
      });
    });
  }

  multiCall(remoteObjectHandle, method, args) {
    const promises = this.connectors.filter(connector => !connector.closed()).map(connectors => connectors.remoteObject(remoteObjectHandle).call(method, args));
    return Promise.all(promises);
  }

  reportState() {
    this.emit('state', this.state);
  }
}

export default Fanout;
