<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  import { readable } from 'svelte/store';

  import { searchMode } from '../testStore.js'

  import Spinner from 'svelte-spinner';

  export let connected;
  export let deviceName;
  export let isSearching;
  export let device;

  function displayDeviceName(deviceName) {
    return deviceName && app.isLAN ? `@${deviceName}` : `@${window.location.hostname}`;
  }
</script>

<p class="connection_status" class:ok={$connected}>
  {#if $connected}
      <!-- maybe replace with serverMode check? -->
      <span class="device_status">
        {app.isLAN ? 'local node' : ''}
        <span class="device_name"> {displayDeviceName(deviceName)}</span> ready
      </span>

      <div class="spinner_or_mark">
        {#if isSearching}
          <span class="spinner"><Spinner size="16" speed="400" color="#fff" thickness="3" gap="40"/></span>
        {:else}
          <img class="mark" src="/apps/zeta/img/redesign/zetaseek_icon-OK.svg" />
        {/if}
      </div>

  {:else}
      <span class="device_status">
        <span class="device_name">{displayDeviceName(deviceName)}</span> reconnecting
      </span>

      <span class="spinner">
        <Spinner size="16" speed="2000" color="#EFCAF8" thickness="3" gap="25"/>
      </span>
  {/if}
</p>

<style>
  p.connection_status {
    color: var(--dmt-warning-pink);
  }

  p.connection_status.ok {
    color: #fff;
  }

  span.device_status {
    display: inline-block;
    vertical-align: middle;
  }

  span.device_name {
    color: var(--dmt-bright-cyan);
  }

  .spinner_or_mark {
    display: inline-block;
    vertical-align: middle;
  }

  img.mark {
    width: 15px;
    display: inline-block;
    vertical-align: middle;
  }

  span.spinner {
    padding-top: 5px; /* not sure why spinner was not centered! this fixes it ... */
    display: inline-block;
    vertical-align: middle;
  }
</style>
