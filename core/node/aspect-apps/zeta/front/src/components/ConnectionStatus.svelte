<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  import Spinner from 'svelte-spinner';

  export let connected;
  export let deviceName;
  export let isSearching;

  function displayDeviceName(deviceName) {
    return deviceName && app.isLocalhost || app.isLAN ? `@${deviceName}` : '';
  }
</script>

<p class="connection_status" class:ok={connected}>
  {#if connected}
    <span class="device_name">{displayDeviceName(deviceName)}</span> {displayDeviceName(deviceName) ? 'ready' : 'Ready'}

    {#if isSearching}
      <Spinner size="15" speed="400" color="#fff" thickness="2" gap="40"/>
    {:else}
      <span class="mark">✓</span>
    {/if}
  {:else}
     <span class="device_name">{displayDeviceName(deviceName)}</span> {displayDeviceName(deviceName) ? 'reconnecting' : 'Reconnecting' } <Spinner size="15" speed="2000" color="#EFCAF8" thickness="3" gap="25"/>
  {/if}
</p>

<style>
  p.connection_status {
    color: var(--dmt-warning-pink);
  }

  p.connection_status.ok {
    color: #fff;
  }

  span.device_name, span.mark {
    color: var(--dmt-bright-cyan);
  }
</style>
