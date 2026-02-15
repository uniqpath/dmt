import MoleClient from './MoleClient.js';
import proxify from './proxify.js';

class MoleClientProxified extends MoleClient {
  constructor(...args) {
    super(...args);
    return proxify(this);
  }
}

export default MoleClientProxified;
