import { ProtocolStore } from 'dmt/connectome-stores';

import onConnect from './onConnect';

export default function setup({ program }) {
  const searchAppStore = new ProtocolStore();

  searchAppStore.syncOver(program.registerProtocol({ protocol: 'dmtapp/search', onConnect }));

  program.store().subscribe(state => {
    const { device, peerlist, entireLinkIndexCloud, entireLinkIndexCount, recentSearchQueries, recentWeblinks } = state; // recentSearchQueries == log of all search queries
    searchAppStore.set({ device, peerlist, entireLinkIndexCloud, entireLinkIndexCount, recentSearchQueries, recentWeblinks });
  });
}
