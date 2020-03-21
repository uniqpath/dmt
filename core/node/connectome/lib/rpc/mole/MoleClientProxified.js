import MoleClient from './MoleClient';
import proxify from './proxify';

class MoleClientProxified extends MoleClient {
  constructor(...args) {
    super(...args);
    return proxify(this);
  }
}

export default MoleClientProxified;
