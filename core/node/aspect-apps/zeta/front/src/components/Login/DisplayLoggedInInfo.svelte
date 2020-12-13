<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let ethAddress;
  export let displayName;
  export let isAdmin;
</script>

<style>
  #eth_identity {
    color: white;
    font-size: 0.8em;

    position: absolute;
    top: 15px;
    top: 0;
    right: 0px;
    /*width: 300px;*/
    padding: 10px;
  }

  #eth_identity span {
    color: var(--dmt-bright-cyan);
  }

  #eth_identity span.admin {
    color: var(--dmt-bright-cyan);
  }

  #eth_identity span.deemph {
    color: #ccc;
    font-size: 0.8em;
  }

  #eth_identity span.anon {
    color: #aaa;
  }

  #eth_identity span.anon span.invite {
    color: var(--dmt-warning-pink);
  }
</style>

<!-- <svg id="eth_address"></svg> -->
<div id="eth_identity">
  {#if displayName}
    {displayName}

    {#if isAdmin}<span class="admin">(+)</span>{/if}
    ←
    <span>{ethAddress}</span>
  {:else}
    MetaMask
    <span>{ethAddress}</span>

    {#if app.isZetaSeek}<br /> <span class="deemph">[ Zeta Balance: 0 ]</span>{/if}
  {/if}
</div>
