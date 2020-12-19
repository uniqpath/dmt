<script>
  export let backend;
  export let loginStore;

  import { onMount, getContext } from 'svelte';
  const app = getContext('app');

  $: panels = $backend.panels;

  function toggle(panel) {
    const newPanels = panels;
    newPanels[panel] = !newPanels[panel];
    backend.set({ panels: newPanels });
  }

  onMount(() => {
    // show whitepaper promo on page load if not logged in

    setTimeout(() => {
      if (loggedIn) {
        toggle('Profile');
      }
    }, 700); // wait for MetaMask to execute login... or not.
  });

  function isEnabled(panel) {
    return panels[panel];
  }
</script>

<div class="menu">
  <span class="title">FRAMES</span>

  <div class="inner">
    <ul>
      {#if app.isLocalhost || loggedIn}
        <li class:enabled={panels['Profile']} on:click={() => toggle('Profile')}>👀 Profile</li>
      {/if}

<!--       <li class:enabled={panels['Zeta Documents']} on:click={() => toggle('Zeta Documents')}><span class="new">NEW</span> Zeta Token Whitepaper <img src="/apps/search/img/zeta_symbol.png" /></li> -->

      <!-- <li class:enabled={panels['Zeta Discord']} on:click={() => toggle('Zeta Discord')}><span class="new">NEW</span> Zeta on Discord <img src="/apps/search/img/discord.svg" /></li> -->

      <!-- <li class:enabled={panels['Swarm Promo']} on:click={() => toggle('Swarm Promo')}>Swarm Network <img style="filter: invert(1);" src="/apps/search/img/swarm-symbol.png" /></li>

      <li class:enabled={panels['Filecoin Promo']} on:click={() => toggle('Filecoin Promo')}>Filecoin Network <img src="/apps/search/img/filecoin-symbol.svg" /></li> -->
    </ul>
  </div>
</div>

<style>
  .menu {
    color: white;
    padding: 10px;
    display: inline-block;
    user-select: none;
  }

  .menu span.title {
    border-bottom: 2px solid var(--zeta-green);;
    cursor: default; /*remove back if menu is hideable or multilevel*/
  }

  .menu .inner {
    /*display: none;*/

    position: relative;
    left: 0;
    top: 0;
  }

  .menu:hover {
    cursor: pointer;
    /*color: var(--zeta-green);*/
  }

  .menu:hover .inner {
    display: block;
  }

  .menu .inner ul {
    list-style-type: none;
    color: white;
  }

  .menu .inner ul li img {
    height: 15px;
  }

  .menu .inner li:before {
    content: "\2022";
    color: white;
    font-weight: 700;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
  }

  .menu .inner li:hover {
    color: var(--dmt-bright-cyan);
    color: #87B2AF;
  }

  .menu .inner li.enabled, .menu .inner li.enabled:before {
    color: var(--zeta-green);
  }

  .menu .inner li .new {
    background-color: #DDDE65;
    color: #333;
    padding: 0 2px;
    border-radius: 2px;
    font-size: 0.8em;
  }

  .menu .inner li.enabled:hover {
    opacity: 0.8;
  }
</style>
