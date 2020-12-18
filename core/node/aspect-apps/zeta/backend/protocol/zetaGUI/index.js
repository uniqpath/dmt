import { MirroringStore } from 'dmt/connectome-stores';

import onConnect from './onConnect';

export default function setup({ program }) {
  const helperStore = new MirroringStore();

  const channelList = program.registerProtocol({ protocol: 'zeta', lane: 'gui', onConnect });
  helperStore.mirror(channelList);

  program.store.subscribe(state => {
    const { device, fiberlist } = state;
    helperStore.set({ device, fiberlist });
  });
}
