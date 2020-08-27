<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let mediaType;
  export let playableUrl;
  export let hasPlayer;

  function play(playableUrl) {
    app.emit('play', { playableUrl });
  }
</script>

<!-- {#if app.isLocalhost && mediaType == 'music'} -->
{#if hasPlayer && mediaType == 'music'}
  <button on:click={() => { play(playableUrl); }}>PLAY</button>
{/if}

<style>
  button {
    border: 0;
    cursor: pointer;
    padding: 0 2px;
    /*font-size: 0.8em;*/
    margin: 0;
  }

  button:hover {
    /*background-color: #7476FF;*/
    background-color: #B54195;
  }
</style>
