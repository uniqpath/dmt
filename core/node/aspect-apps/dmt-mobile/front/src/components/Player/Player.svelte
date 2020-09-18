<!--
  ***************************************
  ********* STATE AND FUNCTIONS *********
  ***************************************
-->

<script>

  import PlayInfo from './components/PlayInfo.svelte';
  import Controls from './components/Controls.svelte';

  export let connected;
  export let player;
  export let fnAction;

</script>

<!--
  *************************
  ********** GUI **********
  *************************
-->

{#if player}
  <PlayInfo {connected} {player} {fnAction} />
{/if}

<Controls {connected} player={player || {}} {fnAction} />

<!--
  *************************
  ********* STYLE *********
  *************************
-->

<style>

</style>


