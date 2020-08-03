<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let isMobile;

  const d = new Date();
  const datestring = `${d.getFullYear()}-${(d.getMonth() + 1)}-${d.getDate()}`;

  let minimized;

  function minimize() {
    minimized = true;
  }
</script>

<!-- {#if app.isZetaSeek} -->

  <div class="about" class:visible={!minimized}>

    <a href="#" class="minimize" on:click={() => minimize()}>X</a>

    {#if app.isZetaSeek}
      <b>Zeta</b><span class="dash">/</span><b><a href="https://dmt-system.com">DMT</a></b> DEMO <span class="version">v{datestring}</span>
    {:else}
      <b><a href="https://zetaseek.com">Zeta</a></b> <span class="version">v{datestring}</span>
    {/if}

    <p>
      An evolving search<sup>+</sup> technology for web3 revolution.
    </p>

    {#if app.isZetaSeek}

      <p>
        <!-- [[ Decentralized ❀ <a href="https://github.com/uniqpath/dmt/tree/master/core/node/aspect-apps/zeta">Open Source</a> ❀ Fair ❀ Free ]] -->
        <!-- [[ Decentralized ∞ Open Source ∞ Fair ∞ Free ]] -->

        <a href="https://discord.gg/XvJzmtF">
          {#if !isMobile}
            <img class="icon" src="/apps/zeta/img/discord.svg"><br>
          {/if}

          JOIN THE DISCUSSION</a>
        <!-- [ If you think all times are the same, you are wrong ] -->
        <!-- [ See further, do more. ] -->
        <!-- [ <span>Imagine all the people sharing all the files</span> — <i>John Lennon</i> ] -->
      </p>

      <p>
        We invite you to the path of enjoyable exploration and collaborative innovation. Come explore the edges!
      </p>

    {/if}

    <!-- <p>
      We move slowly but we keep on moving! 🐍
    </p> -->

    <!-- <p>
      STAY TUNED ❀ <b>THE FUTURE IS NOW</b>
    </p> -->

    <!-- <p>
      [ <span>And the network will live as one.</span> ]
    </p> -->

    <!-- <p>
      Principal use is as an installed engine (desktop or server).
    </p>

    <p>
      Instructions coming soon.
    </p> -->
  </div>

<!-- {/if} -->

<style>
.about {
  width: 260px;
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
}

.about.visible {
  display: block;
}

.about p {
  font-size: 0.8em;
  color: #232527;
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
  text-decoration-style: dotted
  /*font-size: 0.7em;*/
}

a {
  color: white;
  color: #232527;
  text-decoration: underline;
}

a:hover {
  color: #404076;
}

a img.icon {
  width: 60px;
  margin-left: 23px;
}

@media only screen and (max-width: 768px) {
  .about {
    /*display: none;*/
    /*width: 300px;*/
  }
}

</style>
