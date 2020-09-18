<script>
  // import JSONTree from 'svelte-json-tree';
  export let swarm;
</script>

{#if swarm}

  <div class="data">

    {#if swarm}
      <!-- <JSONTree value={swarm} /> -->
    {/if}
  </div>

{/if}

<style>

.data {
  background-color: white;
}

</style>
