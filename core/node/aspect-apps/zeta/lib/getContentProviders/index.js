import path from 'path';
import dmt from 'dmt/bridge';
import { resolveENS } from 'dmt/resolve';

import readZetaDef from './readZetaDef';

const { def } = dmt;

function readProvidersFromDef(zetaDef) {
  return def.values(def.tryOnTheFly(zetaDef, 'contentProviders.content'));
}

function resolve(provider) {
  if (provider.endsWith('.eth')) {
    const { ip, port } = resolveENS(provider);
    return `@${ip}:${port}`;
  }

  return provider;
}

function getContentProviders() {
  const globalZetaDef = readZetaDef(path.join(dmt.dmtPath, 'def/zeta_search.def'));
  const deviceZetaDef = readZetaDef(dmt.deviceDefFile(dmt.device().id, 'zeta_search'));

  const providers = ['@this', '@this/links', '@this/swarm'];
  providers.push(...readProvidersFromDef(deviceZetaDef));
  providers.push(...readProvidersFromDef(globalZetaDef));

  return providers.map(resolve);
}

export default getContentProviders;
