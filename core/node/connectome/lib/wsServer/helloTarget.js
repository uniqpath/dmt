import EventEmitter from '../emitter';

class HelloTarget extends EventEmitter {
  hello(clientInitData) {
    this.emit('done', clientInitData);
  }
}

export default HelloTarget;
