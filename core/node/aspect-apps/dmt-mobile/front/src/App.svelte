<!--
  ***************************************
  ********* STATE AND FUNCTIONS *********
  ***************************************
-->
<script>
  import DeviceTitle from './components/Device/DeviceTitle.svelte';
  import Player from './components/Player/Player.svelte';
  import NearbyDevices from './components/NearbyDevices/NearbyDevices.svelte';

  export let store;
  export let dmtJS;

  const { util } = dmtJS;

  $: connected = $store.connected;

  $: device = $store.device;
  $: deviceName = $store.optimisticDeviceName;

  $: player = $store.player;

  $: nearbyDevices = $store.nearbyDevices ? $store.nearbyDevices.filter(device => device.hasGui).sort(util.compareValues('deviceName')) : [];

  $: activeDeviceKey = $store.activeDeviceKey;

  //const usualDeviceList = ['kitchen', 'midroom', 'outside', 'living-room', 'tv', 'dpanel', 'lab'];

  import { storeAction, switchDevice } from './AppFunctions.js';

  function fnSwitchDevice(device) {
    switchDevice({ store, device });
  }

  function fnAction(action, payload) {
    storeAction({ store, action, payload });
  }

</script>

<!--
  *************************
  ********** GUI **********
  *************************
-->
<main>

  <DeviceTitle {connected} {deviceName} />
  <Player {connected} {player} {fnAction} />
  <NearbyDevices {nearbyDevices} {activeDeviceKey} {fnSwitchDevice} />

</main>

<!--
  *************************
  ********* STYLE *********
  *************************
-->
<style>

  main {
		text-align: center;
		margin: 0 auto;
	}

  :global(button) {
    margin-left: 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  :global(button:hover) {
    opacity: 0.9;
  }

  :global(p) {
    padding: 0;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
