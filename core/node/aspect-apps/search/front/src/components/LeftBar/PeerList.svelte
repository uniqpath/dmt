<script>
  import { getContext } from 'svelte';

  export let backend;

  const app = getContext('app');

  $: device = $backend.device;
  $: dmtVersion = device ? device.dmtVersion : null;

  const { connected } = backend;
  $: peerlist = $backend.peerlist;
</script>

<div class="peerlist">

  {#if $connected}
    {#if peerlist && peerlist.length > 0}
      <span class="title">— Following Peers —</span>
    {:else}
      <span class="title">Peers → <span class="white">Not following anyone yet.</span></span>
    {/if}

    {#if peerlist}
      {#each peerlist as { deviceTag, connected, versionCompareSymbol, peerState }}
        <div class="peer" class:connected={connected == true}>
          <span class="ok">ok</span>
          <span class="cross">✖</span>
          {deviceTag}
          {#if peerState}
            {#if peerState.dmtVersion}
              <span class="dmt_version">
                {#if versionCompareSymbol}
                  {versionCompareSymbol}
                {/if}
                {peerState.dmtVersion}
              </span>
            {/if}
          {/if}
        </div>
      {/each}
    {/if}
  {/if}

</div>

<style>

.peerlist {
  padding: 10px;
  color: #777;
}

.peerlist .title {
  color: var(--zeta-green);
  color: var(--dmt-bright-cyan);
}

/*.peerlist .title.has_peers {
  padding-left: 30px;
}*/

span.white {
  color: white;
}

.peer.connected {
  color: white;
}

.ok, .cross {
  width: 20px;
  display: inline-block;
  text-align: center;
}

.ok {
  /**/
  display: none;
  /*color: #78DF79;*/
  color: var(--dmt-cool-green);
}

.cross {
  color: #E03434;
}

.peer.connected .ok {
  display: inline-block;
}

.peer.connected .cross {
  display: none;
}

.peer .dmt_version {
  font-size: 0.6em;
  color: #888;
}

.peer .dmt_version.strong {
  color: var(--dmt-bright-cyan);
}

</style>
