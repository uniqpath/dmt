<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  import { readable } from 'svelte/store';

  import { searchMode } from '../testStore.js'

  import Spinner from 'svelte-spinner';

  export let connected;
  export let deviceName;
  export let isSearching;
  export let controller;

  $: swarmBeeRunning = controller ? controller.swarmBeeRunning : undefined;

  // NOT NEEDED!! :::
  // const swarmBeeRunning = readable(undefined, function start(set) {
  //   const interval = setInterval(() => {
  //     set(controller && controller.swarmBeeRunning);
  //   }, 1000);

  //   return function stop() {
  //     clearInterval(interval);
  //   };
  // });

  function displayDeviceName(deviceName) {
    return deviceName && (app.isLocalhost || app.isLAN) ? `@${deviceName}` : `@${window.location.hostname}`;
  }
</script>

<p class="connection_status" class:ok={connected}>
  {#if connected}
    <div class="inside">
      <!-- maybe replace with serverMode check? -->
      {app.isLocalhost || app.isLAN ? '' : 'p2p node'}
      <span class="device_name"> {displayDeviceName(deviceName)}</span> ready
      <!-- {displayDeviceName(deviceName) ? 'ready' : 'Ready'} -->

      {#if isSearching}
        <Spinner size="15" speed="400" color="#fff" thickness="2" gap="40"/>
      {:else}
        <span class="mark">✓</span>
      {/if}

      <div class="tooltip">
        <img class="bee" src="/apps/zeta/img/bee.png" class:hidden={!swarmBeeRunning} alt="swarm-bee"  />
        <span class="tooltiptext">Swarm node active</span>
      </div>

      <div class="tooltip inactive">
        <img class="bee" src="/apps/zeta/img/bee_inactive.png" class:hidden={swarmBeeRunning} alt="swarm-bee-inactive" />
        <span class="tooltiptext">Swarm node not active</span>
      </div>

    </div>
  {:else}
     <span class="device_name">{displayDeviceName(deviceName)}</span> reconnecting <Spinner size="15" speed="2000" color="#EFCAF8" thickness="3" gap="25"/>
  {/if}
</p>

<style>
  p {
    /*display: inline-block;    */
  }

  p.connection_status {
    color: var(--dmt-warning-pink);
  }

  p.connection_status.ok {
    color: #fff;
  }

  p.connection_status .inside {
    /*display: inline-block;
    vertical-align: middle;*/
    /*height: 20px;*/
  }

  .bee {
    width: 17px;
    vertical-align: middle;
    padding-bottom: 5px;
  }

  .bee.hidden {
    display: none;
  }

  span.device_name {
    /*color: var(--dmt-bright-cyan);*/
    color: var(--dmt-bright-cyan);
  }

  span.mark {
    color: var(--dmt-bright-cyan);
  }

  /*TOOLTIP*/

  /* Tooltip container */
  .tooltip {
    position: relative;
    display: inline-block;
  }

  /* Tooltip text */
  .tooltip .tooltiptext {
    visibility: hidden;
    width: 150px;
    font-size: 0.9em;
    background-color: var(--dmt-bright-cyan);
    /*color: #fff;*/
    color: #333;
    text-align: center;
    padding: 5px 3px;
    border-radius: 6px;

    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
  }

  .tooltip.inactive .tooltiptext {
    background-color: var(--dmt-warning-pink);
    color: black;
  }

  .tooltip .tooltiptext {
    top: -5px;
    left: 20px;
  }

  /* Show the tooltip text when you mouse over the tooltip container */
  .tooltip:hover .tooltiptext {
    visibility: visible;
  }
</style>
