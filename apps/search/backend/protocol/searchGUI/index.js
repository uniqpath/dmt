import { MirroringStore } from 'dmt/connectome-stores';

// const { MirroringStore } = stores;

import onConnect from './onConnect';

export default function setup({ program }) {
  const backend = new MirroringStore();

  const channelList = program.registerProtocol({ protocol: 'dmtapp', lane: 'search', onConnect });
  backend.mirror(channelList);

  program.store.subscribe(state => {
    const { device, peerlist, entireLinkIndexCloud, entireLinkIndexCount, recentSearchQueries, recentWeblinks } = state; // recentSearchQueries == log of all search queries
    backend.set({ device, peerlist, entireLinkIndexCloud, entireLinkIndexCount, recentSearchQueries, recentWeblinks });
  });
}
