<!--
  ***************************************
  ********* STATE AND FUNCTIONS *********
  ***************************************
-->
<script>
  export let connected;
  export let player;

  export let fnAction;
</script>

<!--
  *************************
  ********** GUI **********
  *************************
-->
<div class="player_controls section">

  {#if player.paused}
    <button on:click={() => fnAction('play')} class="play" disabled={!$connected}>▶ Play </button>
  {:else}
    <button on:click={() => fnAction('pause')} class="pause" disabled={!$connected}>● Pause</button>
  {/if}

  <button on:click={() => fnAction('volume_down')} class="volume" disabled={!$connected}>Vol ↓</button>
  <button on:click={() => fnAction('volume_up')} class="volume" disabled={!$connected}>Vol ↑</button>

</div>

<div>
  <!-- <button on:click={() => toggleMore()} class="more" class:bold={playerMoreVisible}>More</button> -->

  <button on:click={() => fnAction('limit')} class="limit" disabled={!$connected}>Limit {player.limit || ''}</button>
  {#if player.limit > 0}
    <button on:click={() => fnAction('remove_limit')} class="remove_limit" disabled={!$connected}>Remove</button>
  {/if}

  <button on:click={() => fnAction('next')} class="next" disabled={!$connected}>→ Next</button>
</div>

<div>
  <button on:click={() => fnAction('shuffle')} class="shuffle" disabled={!$connected}>Shuffle</button>
  <button on:click={() => fnAction('repeat')} class="repeat" disabled={!$connected}>Repeat {player.repeatCount || ''}</button>

  <button on:click={() => fnAction('backward')} class="backward" disabled={!$connected}>↞ RWD</button>
  <button on:click={() => fnAction('forward')} class="forward" disabled={!$connected}>↠ FWD</button>
</div>

<!--
  *************************
  ********* STYLE *********
  *************************
-->
<style>

button.remove_limit {
  color: #777;
  background-color: white;
}

</style>
