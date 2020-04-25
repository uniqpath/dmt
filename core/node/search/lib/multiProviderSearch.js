import path from 'path';
import dmt from 'dmt/bridge';

import { fiberHandle } from 'dmt/connectome';

import LocalProviderSearch from './localProviderSearch';
import RemoteProviderSearch from './remoteProviderSearch';

const { log, util } = dmt;

class MultiProviderSearch {
  constructor({ program, providers, mediaType } = {}) {
    this.program = program;

    const providerList = util.listify(providers).map(provider => Object.assign(provider, { providerAddress: dmt.hostAddress(provider) }));

    const localProviders = providerList.filter(provider => provider.localhost);
    this.localProvidersCount = localProviders.length;

    const remoteProviders = providerList.filter(provider => !provider.localhost);
    this.remoteProvidersCount = remoteProviders.length;

    this.searchArray = localProviders.map(provider => {
      return new LocalProviderSearch({ provider, mediaType });
    });

    remoteProviders.forEach(provider => {
      program.fiberPool.getConnector(provider.providerAddress).then(connector => {
        this.searchArray.push(new RemoteProviderSearch({ provider, mediaType, connector }));
      });
    });
  }

  async search(options) {
    return new Promise((success, reject) => {
      const allProvidersReady = this.remoteProvidersCount + this.localProvidersCount == this.searchArray.length;

      if (allProvidersReady) {
        const searches = this.searchArray.map(providerSearch => {
          return new Promise((success, reject) => {
            providerSearch
              .search(options)
              .then(providerResponse => success({ providerResponse, providerAddress: providerSearch.providerAddress }))
              .catch(e => {
                console.log(e);
                reject(e);
              });
          });
        });

        Promise.all(searches)
          .then(allResponses => {
            for (const { providerResponse, providerAddress } of allResponses) {
              if (providerResponse.results) {
                providerResponse.results.forEach(result => {
                  const fileName = path.basename(result.filePath);
                  const directory = path.dirname(result.filePath);

                  result.fiberHandle = fiberHandle.create({ fileName, directory, ip: providerAddress });

                  result.fiberContentURL = `http://localhost:${dmt.determineGUIPort()}/file/${result.fiberHandle}`;

                  if (result.fiberContentURL.length > 2000) {
                    log.read(
                      `Warning: URL seems to long, limit is 2048 ${result.fiberContentURL}, todo: use better encoding to reduce the file system path size, as well as trim file name if really long?`
                    );
                  }
                });
              }
            }

            success(allResponses.map(resp => resp.providerResponse));
          })
          .catch(e => {
            console.log('TOTAL REJECT');
            console.log(e);
            reject(e);
          });
      } else {
        setTimeout(() => {
          this.search(options)
            .then(success)
            .catch(reject);
        }, 20);
      }
    });
  }
}

export default MultiProviderSearch;
