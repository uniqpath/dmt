<script>
  export let backend;

  const { connected } = backend;
  $: peerlist = $backend.peerlist;
</script>

<div class="peerlist">

  {#if $connected}
    {#if peerlist && Object.keys(peerlist).length > 0}
      <span class="title">— Following peers —</span>
    {:else}
      <span class="title">Peers → <span class="white">Not following anyone yet.</span></span>
    {/if}

    {#if peerlist}
      {#each Object.keys(peerlist) as deviceName}
        <div class="peer" class:connected={peerlist[deviceName].connected == true}>
          <span class="ok">ok</span>
          <span class="cross">✖</span>
          {deviceName}
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
  color: #78DF79;
  display: none;
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

</style>
