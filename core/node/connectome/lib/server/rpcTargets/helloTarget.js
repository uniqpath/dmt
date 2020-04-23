import { EventEmitter } from '../../utils';

class HelloTarget extends EventEmitter {
  hello(clientInitData) {
    this.emit('done', clientInitData);
  }
}

export default HelloTarget;
