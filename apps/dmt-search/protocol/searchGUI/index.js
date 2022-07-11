import { SyncStore } from 'dmt/connectome-stores';

import onConnect from './onConnect';

export default function setup({ program }) {
  const store = new SyncStore();

  store.sync(program.registerProtocol({ protocol: 'dmtapp/search', onConnect }));

  program.store().subscribe(state => {
    const { device, peerlist, entireLinkIndexCloud, entireLinkIndexCount, recentSearchQueries, recentWeblinks } = state; // recentSearchQueries == log of all search queries

    // store.slot('device').set(device, { announce: false });
    // store.slot('peerlist').set(peerlist, { announce: false });
    // store.slot('entireLinkIndexCloud').set(entireLinkIndexCloud, { announce: false });
    // store.slot('entireLinkIndexCount').set(entireLinkIndexCount, { announce: false });
    // store.slot('recentSearchQueries').set(recentSearchQueries, { announce: false });
    // store.slot('recentWeblinks').set(recentWeblinks, { announce: false });

    // store.announceStateChange();

    store.update({ device, peerlist, entireLinkIndexCloud, entireLinkIndexCount, recentSearchQueries, recentWeblinks });
  });
}
