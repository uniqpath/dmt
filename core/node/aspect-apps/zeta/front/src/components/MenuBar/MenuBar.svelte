<script>
  export let store;

  $: panels = $store.panels;

  function toggle(panel) {
    const newPanels = panels;
    newPanels[panel] = !newPanels[panel];
    store.set({ panels: newPanels });
  }

  function isEnabled(panel) {
    return panels[panel];
  }
</script>

<div class="menu">
  <span>PANELS</span>

  <div class="inner">
    <ul>
      <li class:enabled={panels['Profile']} on:click={() => toggle('Profile')}>Profile</li>
      <li class:enabled={panels['Zeta Discord']} on:click={() => toggle('Zeta Discord')}>Zeta on Discord <img src="/apps/zeta/img/discord.svg" /></li>
      <!-- <li class:enabled={panels['My Links']} on:click={() => toggle('My Links')}>My Links</li> -->
      <li class:enabled={panels['Swarm Promo']} on:click={() => toggle('Swarm Promo')}>Swarm Technology <img style="filter: invert(1);" src="/apps/zeta/img/swarm.png" /></li>
    </ul>
  </div>
</div>

<style>
  .menu {
    color: white;
    padding: 10px;
    display: inline-block;
    /*position: fixed;
    top: 0;
    left: 0;*/
    user-select: none;
  }

  .menu span {
    border-bottom: 2px solid var(--zeta-green);;
  }

  .menu .inner {
    display: none;

    position: relative;
    left: 0;
    top: 0;
  }

  .menu:hover {
    cursor: pointer;
    color: var(--zeta-green);
  }

  /*.menu button:hover {
    cursor: pointer;
    color: var(--zeta-green);
  }*/

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
    /*color: #9884fc;*/
    color: white;
    font-weight: 700;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
  }

  .menu .inner li:hover {
    /*color: var(--zeta-green);*/
    /*color: #ddd;*/
    /*opacity: 0.8;*/
    color: #FD609E;
    /*color: #66E5D0;*/
  }

  .menu .inner li.enabled, .menu .inner li.enabled:before {
    color: var(--zeta-green);
  }
</style>
