import dmt from 'dmt/common';
import { push } from 'dmt/notify';

import { parseSearchQuery, serializeContentRefs } from 'dmt/search';
//import getContentProviders from '../getContentProviders';

import { fiberHandle } from 'dmt/connectome-next';

const RESULTS_LIMIT = 20;

const { log } = dmt;

function enhanceThisMachineResponse({ response, isLAN }) {
  const { meta } = response;

  meta.thisMachine = true;

  if (isLAN) {
    meta.providerTag = meta.providerHost;
  } else {
    meta.providerTag = 'this'; //searchOriginHost;
  }
}

function enhanceResponses({ responses, peerlist, isLAN }) {
  // TODO! useful... to search any device from the field!! @solar ... !! NICE!
  // if (atDevices.length > 0 && dmt.isDevMachine()) {
  //   // for now
  //   // todo, improve ... now we loose device name... @solar is mapped to @192.168.0.10 ... how to keep this info? just use @host if type == 'dmt'
  //   // verify if this is good enough
  //   providers = serializeContentRefs(atDevices);
  // } else {

  //console.log(responses);

  // inject local-perspective provider tags!
  for (const response of responses) {
    const { meta } = response;
    if (meta) {
      const matchingPeer = peerlist.find(({ address }) => address == meta.providerAddress);
      //console.log(matchingPeer);
      if (matchingPeer) {
        meta.providerTag = matchingPeer.deviceTag;
      } else {
        enhanceThisMachineResponse({ response, isLAN });
      }
    }
  }

  return responses;
}

class GUISearchObject {
  constructor({ program, channel }) {
    this.program = program;
    this.channel = channel;
  }

  search({ query, page, selectedTags, searchMetadata, timezone }) {
    //log.green(`Selected tags: ${selectedTags.join(', ')}`);

    const { searchOriginHost, isLAN } = searchMetadata;

    //const peerlist = searchMode == 0 ? this.program.peerlist() : [];
    const peerlist = [];
    const peerAddresses = peerlist.length > 0 ? peerlist.map(({ address }) => address) : [];

    // console.log(`SEARCH TRIGGERED:`);
    // console.log(query);
    // console.log('-------------');
    return new Promise(success => {
      // sanitize query, only extract terms and mediatype, ignore all @-attributes
      // it provides some sequrity but real backend authorization on fibers is given elsewhere
      // (default is allow all among user's devices, except for "MANAGEDDEVICES" which have allowance permissions inside zeta_search.def for that device)

      const { terms, mediaType, count, page: parsedPage, atDevices } = parseSearchQuery({ query });

      // todo: serialize these missing ! for now they will be ignored

      const providers = ['this']
        .concat(peerAddresses)
        .map(provider => `@${provider}/links @${provider}`)
        .join(' ');

      this.program
        .actor('search')
        .call('search', { query: `${terms.join(' ')} ${providers} @page=${page} @count=${RESULTS_LIMIT}`, selectedTags, searchOriginHost })
        //.call('search', { query: `${providers.join(' ')} @count=10 ${query}`, searchOriginHost })
        .then(responses => {
          //console.log(JSON.stringify(responses, null, 2));

          const totalHits = responses.filter(res => res.results).reduce((totalHits, res) => totalHits + res.results.length, 0);
          //console.log('EMITTING SEARCH');
          this.program.emit('dmtapp::search::query', { query, page, selectedTags, timezone, totalHits, searchMetadata });
          success(enhanceResponses({ responses, peerlist, isLAN }));
        })
        .catch(error => {
          // never happened so far
          log.yellow('GUISearchObject error:');
          log.yellow(error);
        });
    });
  }

  // browsePlace({ place, searchMetadata }) {
  //   const { searchOriginHost, isLAN, searchMode } = searchMetadata;

  //   const peerlist = searchMode == 0 ? this.program.peerlist() : [];

  //   return new Promise(success => {
  //     const count = 500; // remove after impolementin pagination!
  //     const page = 'TODO!';

  //     this.program
  //       .actor('search')
  //       .call('search', { query: `@count=${count}`, place, searchOriginHost })
  //       //.call('search', { query: `${providers.join(' ')} @count=10 ${query}`, searchOriginHost })
  //       .then(responses => {
  //         const totalHits = responses.filter(res => res.results).reduce((totalHits, res) => totalHits + res.results.length, 0);
  //         //console.log('EMITTING SEARCH');
  //         this.program.emit('zeta::user_search', { query: `place: ${fiberHandle.decode(place)}`, selectedTags, totalHits, searchMetadata });
  //         success(enhanceResponses({ responses, peerlist, isLAN }));
  //       })
  //       .catch(error => {
  //         // never happened so far
  //         log.yellow('GUISearchObject error:');
  //         log.yellow(error);
  //       });
  //   });
  // }

  // todo: move to guiFrontendAcceptor
  trackLinkClick(payload) {
    this.program.emit('dmtapp::link_click', payload);
  }

  trackFileClick(payload) {
    this.program.emit('dmtapp::file_click', payload);
  }
}

export default GUISearchObject;
