import dmt from 'dmt/bridge';
import { resolveENS } from 'dmt/resolve';

function getContentProviders() {
  const providers = [];

  const { ip, port } = resolveENS('zeta.eth');

  if (dmt.isDevMachine() || dmt.device().id == 'andreja') {
    providers.push('@this/swarm');
    providers.push('@solar/music');
  } else {
    providers.push(`@${ip}:${port}/swarm`);
  }

  providers.push(...[`@${ip}:${port}`, '@this']);

  return providers;
}

export default getContentProviders;
