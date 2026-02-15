import { SyncStore } from 'connectome/stores';

import onConnect from './onConnect.js';

export default function setup({ program }) {
  const store = new SyncStore();

  // todo: ugly -- change dmtID here... can't be dmtapp!
  store.sync(program.dev('dmtapp').registerProtocol('search', onConnect));

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
