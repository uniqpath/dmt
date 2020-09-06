<script>
  import { util, xstate, Escape } from 'dmt-js';

  export let store;
  export let session;

  $: connected = $store.connected;
  $: controller = $store.controller;
  $: player = $store.player;
  $: nearbyDevices = $store.nearbyDevices ? $store.nearbyDevices.filter(device => device.hasGui).sort(util.compareValues('deviceName')) : [];

  $: clientPubkey = $session.publicKeyHex;
  $: sharedSecretHex = $session.sharedSecretHex;

  $: activeDeviceName = controller ? controller.deviceName : null;

  //const usualDeviceList = ['kitchen', 'midroom', 'outside', 'living-room', 'tv', 'dpanel', 'lab'];

  let searchTerms;

  // METHODS :::

  function action(action, payload) {
    console.log(`Action: ${action}`);

    store
      .remoteObject('gui')
      .call('action', { action, storeName: 'player', payload })
      .catch(console.log);
  }

  function iotAction(action, payload) {
    console.log(`Action: ${action}`);

    store
      .remoteObject('gui')
      .call('action', { action, storeName: 'iot', payload })
      .catch(console.log);
  }

  function switchDevice(device) {
    localStorage.setItem('current_device_ip', device.ip);
    store.switch(device);
  }

  let playerMoreVisible = false;

  function toggleMore() {
    playerMoreVisible = !playerMoreVisible;
  }

  function pad(number, digits = 2) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
  }

  function songTime(s) {
    s = Math.round(s);
    const hours = Math.floor(s / 3600);
    const rem = s % 3600;
    const min = Math.floor(rem / 60);
    s = rem % 60;

    return hours ? `${hours}h ${pad(min)}min ${pad(s)}s` : `${min}:${pad(s)}`;
  }

</script>

<main>

  <Escape />

  <!-- <p>{connected ? '' : 'Disconnected ✖'}</p> -->

  <!-- <input bind:value={searchTerms} on:keyup={searchInputChanged} on:paste={searchInputChanged}> -->

  {#if controller}

    <h2 class:faded={!connected}>{controller.deviceName} {connected ? '' : '✖'}</h2>

    {#if player}

      <div class="player_media section">

        {#if player.currentMedia && player.currentMedia.song && connected}
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
        {:else if connected}
          <p><b>No media loaded</b></p>
        {/if}

        {#if connected}
          <p class:faded={player.paused}>Volume: {player.volume}</p>
        {/if}

      </div>

      <div class="player_controls section">

        {#if player.paused}
          <button on:click={() => action('play')} class="play" disabled={!connected}>▶ Play </button>
        {:else}
          <button on:click={() => action('pause')} class="pause" disabled={!connected}>● Pause</button>
        {/if}

        <button on:click={() => action('volume_down')} class="volume" disabled={!connected}>Vol ↓</button>
        <button on:click={() => action('volume_up')} class="volume" disabled={!connected}>Vol ↑</button>

        <!-- <button on:click={() => toggleMore()} class="more" class:bold={playerMoreVisible}>More</button> -->

      </div>

      <div class="player_more section" class:visible={playerMoreVisible}>

        <button on:click={() => action('limit')} class="limit" disabled={!connected}>Limit {player.limit || ''}</button>
        {#if player.limit > 0}
          <button on:click={() => action('remove_limit')} class="remove_limit" disabled={!connected}>Remove</button>
        {/if}

        <button on:click={() => action('next')} class="next" disabled={!connected}>→ Next</button>
        <button on:click={() => action('shuffle')} class="shuffle" disabled={!connected}>Shuffle</button>
        <button on:click={() => action('repeat')} class="repeat" disabled={!connected}>Repeat {player.repeatCount || ''}</button>

        <button on:click={() => action('backward')} class="backward" disabled={!connected}>↞ RWD</button>
        <button on:click={() => action('forward')} class="forward" disabled={!connected}>↠ FWD</button>
      </div>

    {/if}

  {/if}

  {#if nearbyDevices}
    <div class="nearby_devices section">
      <!-- window.location.hostname != '192.168.0.60' || -->
      {#each nearbyDevices as device}
      <!-- {#each nearbyDevices.filter(device => usualDeviceList.includes(device.deviceName)) as device} -->

        <button on:click={switchDevice(device)} class:active={device.deviceName == activeDeviceName}>

          {#if device.hasErrors}<span class='error'>!</span>{/if}

          {#if device.playing}
            {device.mediaType == 'music' ? '♫' : '▶'}
          {/if}

          {device.deviceName}
        </button>
      {/each}
    </div>
  {/if}

  <!-- <div class="iot section">
      <button on:click={() => iotAction('alarm', 'on')} class="" disabled={!connected}>Alarm:ON</button>
      <button on:click={() => iotAction('alarm', 'off')} class="" disabled={!connected}>Alarm:OFF</button>
  </div> -->

</main>

<style>
	main {
		text-align: center;
		margin: 0 auto;
	}

  .current_media {
    color: #3B419A;
  }

  .section {
    padding: 10px 10px;
  }

	.player_media {
    /**/
  }

  .player_controls {
    /**/
  }

  .player_more {
    /*display: none;*/
  }

  .player_more.visible {
    display: block;
  }

  .nearby_devices, .iot {
    border-top: 1px solid #999;
    /**/
  }

  h2.faded, p.faded {
    color: #999;
  }

  button {
    margin-left: 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    opacity: 0.9;
  }

  button.active {
    border: 2px solid #3B419A;
  }

  button.more {
    /**/
  }

  button.more.bold {
    font-weight: bold;
  }

  button.remove_limit {
    color: #777;
    background-color: white;
  }

  .error {
    background-color: #983128;
    color: white;
    padding: 2px 5px;
    margin-right: 5px;
  }

  p {
    padding: 0;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
