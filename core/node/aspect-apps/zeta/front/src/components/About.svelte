<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let isMobile;
  export let searchQuery;
  export let dmtVersion;

  // const d = new Date();
  // const datestring = `${d.getFullYear()}-${(d.getMonth() + 1)}-${d.getDate()}`;

  $: displayVersion = dmtVersion ? `v${dmtVersion}` : ''

  let minimized;

  function minimize() {
    minimized = true;
  }
</script>

  {#if app.isDevMachine}
    <img src="/apps/zeta/img/wabbit.png" class="wabbit">
  {/if}

  <div class="about" class:visible={!minimized && !searchQuery}>

    <a href="#" class="minimize" on:click={() => minimize()}>X</a>

    <!-- {#if app.isZetaSeek} -->
      <p>
        <a href="https://dmt-system.com"><img src="/apps/zeta/img/dmt_symbol.png" class="icon_symbol" /></a>
        <a href="https://zetaseek.com"><img src="/apps/zeta/img/zeta_symbol.png" class="icon_symbol" /></a>
        <!-- <a href="https://github.com/uniqpath/dmt#we-are-now-ready-to-setup-the--zeta-explorer-node"><img src="/apps/zeta/img/tropical_fish.png" class="icon_symbol" /></a> -->


        <!-- <b>Zeta</b> -->
        <!-- <span class="dash">/</span> -->
        <!-- <b><a href="https://dmt-system.com">DMT-SYSTEM</a></b> -->
        <span class="version">{displayVersion}</span> —
        <a href="https://discord.gg/XvJzmtF"><!-- <img class="icon_symbol" src="/apps/zeta/img/discord.svg" /> -->live support</a>
      </p>

    <!-- {:else}
      <b><a href="https://zetaseek.com">zetaseek</a></b>
      <span class="version">{displayVersion}</span>

      <p>
        An evolving search<sup>+</sup> technology for web3 revolution.
      </p>
    {/if} -->
    <!-- {:else}
      <b><a href="https://zetaseek.com">Zeta</a></b> <span class="version">{displayVersion}</span>
    {/if} -->

    <!-- {#if app.isZetaSeek} -->

  </div>


<style>
.wabbit {
  left: 0;
  bottom: 0;
  position: fixed;
  width: 70px;
  padding: 20px;
}

.about {
  width: 230px;
  position: fixed;
  right: 0;
  bottom: 0;
  padding: 10px;
  color: white;
  font-size: 0.8em;
  opacity: 0.8;
  border-top-left-radius: 10px;
  color: #232527;
  background-color: #A4938B;
  background-color: #D9EBD5;
  display: none;
  /*display: inline-block;
  vertical-align: middle;*/
}

.about.visible {
  display: block;
}

.about p {
  font-size: 0.9em;
  color: #232527;
  /*margin: 0;*/
}

.about img.icon_symbol {
  width: 20px;
  vertical-align: middle;
  padding-bottom: 3px;
}

/*.about span {
  color: #777;
  color: #535B62;
  color: #5D6270;
  color: var(--dmt-violet-dark);
}*/

.about span.dash {
  padding: 0 2px;
}

.about span.version {
  font-size: 0.8em;
}

.about a.minimize {
  float: right;
  font-weight: bold;
  text-decoration-style: dotted;
  font-size: 0.8em;
}

a {
  color: white;
  color: #232527;
  text-decoration: underline;
}

a:hover {
  color: #404076;
}

a img:hover {
  opacity: 0.8;
}

a img.icon {
  width: 20px;
  /*margin-left: 23px;*/
}

p.explorers {
  font-size: 1.1em;
}

p span.fish {
  font-size: 1.5em;
}

@media only screen and (max-width: 768px) {
  .about {
    /*display: none;*/
    /*width: 300px;*/
  }
}

</style>
