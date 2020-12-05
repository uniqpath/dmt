import { stores } from 'dmt/connectome';

const { MirroringStore } = stores;

import onConnect from './onConnect';

export default function setup({ program }) {
  const helperStore = new MirroringStore();

  const channelList = program.registerProtocol({ protocol: 'zeta', lane: 'gui', onConnect });
  helperStore.mirror(channelList);

  program.store.subscribe(state => {
    helperStore.set({ device: state.device });
  });
}
