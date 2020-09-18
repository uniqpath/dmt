<!--
  ***************************************
  ********* STATE AND FUNCTIONS *********
  ***************************************
-->
<script>
  export let nearbyDevices;
  export let activeDeviceKey;

  // functions
  export let fnSwitchDevice;
</script>

<!--
  *************************
  ********** GUI **********
  *************************
-->
<div class="nearby_devices">
  <!-- window.location.hostname != '192.168.0.60' || -->
  {#each nearbyDevices as device}
  <!-- {#each nearbyDevices.filter(device => usualDeviceList.includes(device.deviceName)) as device} -->

    <button on:click={fnSwitchDevice(device)} class:active={device.deviceKey == activeDeviceKey}>

      {#if device.hasErrors}<span class='error'>!</span>{/if}

      {#if device.playing}
        {device.mediaType == 'music' ? '♫' : '▶'}
      {/if}

      {device.deviceName}
    </button>

  {/each}

</div>

<!--
  *************************
  ********* STYLE *********
  *************************
-->
<style>

.nearby_devices {
  padding: 10px 10px;
  border-top: 1px solid #999;

  margin: 0 auto;
}

.nearby_devices button.active {
  border: 2px solid #3B419A;
}

.error {
  background-color: #983128;
  color: white;
  padding: 2px 5px;
  margin-right: 5px;
}

</style>
