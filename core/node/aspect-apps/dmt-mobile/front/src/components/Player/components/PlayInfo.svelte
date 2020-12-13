<!--
  ***************************************
  ********* STATE AND FUNCTIONS *********
  ***************************************
-->
<script>
  export let connected;
  export let player;

  import { songTime } from './PlayerFunctions.js'
</script>

<!--
  *************************
  ********** GUI **********
  *************************
-->
<div class="player_media">

  {#if player.currentMedia && player.currentMedia.song && $connected}
    <p class="current_media" class:faded={player.paused}>
      {player.paused ? ' ' : (player.currentMedia.mediaType == 'video' ? '▶' : '♫')}
      {player.currentMedia.artist ? `${player.currentMedia.artist} - ${player.currentMedia.song}` : player.currentMedia.song}
    </p>
    <p class:faded={player.paused}>
      {#if player.isStream}
        (radio)
      {:else}
        {#if player.timeposition}
          {songTime(Math.floor(player.timeposition))} / {songTime(player.currentMedia.duration)} — {Math.round(player.percentposition)}%
        {:else if player.duration}
          {songTime(player.currentMedia.duration)}
        {/if}
      {/if}
    </p>
  {:else if $connected}
    <p><b>No media loaded</b></p>
  {/if}

  {#if $connected}
    <p class:faded={player.paused}>Volume: {player.volume}</p>
  {/if}

</div>

<!--
  *************************
  ********* STYLE *********
  *************************
-->
<style>

p.faded {
  color: #999;
}

.player_media {
  padding: 10px 10px;
}

.current_media {
  color: #3B419A;
}

</style>
