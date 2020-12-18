<script>
  export let backend;

  const { connected } = backend;
  $: fiberlist = $backend.fiberlist;
</script>

<div class="fiberlist">

  {#if fiberlist && $connected}
    {#each Object.keys(fiberlist) as deviceName}
      <div class="peer" class:connected={fiberlist[deviceName].connected == true}>
        <span class="ok">ok</span>
        <span class="cross">✖</span>
        {deviceName}
      </div>
    {/each}
  {/if}

</div>

<style>

.fiberlist {
  padding: 10px;
  color: #777;
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
