<script>
  import { onMount } from 'svelte';

  export let tokenBalance;

  $: progressDots = '';

  function updateDots() {
    if (progressDots.length < 3) {
      progressDots += '.';
    } else {
      progressDots = '';
    }

    setTimeout(updateDots, 3000);
  }

  onMount(() => {
    updateDots();
  });

  const sections = {
    "about": { visible: false },
    "why": { visible: false },
    "why2": { visible: false }
  };

  function toggleSection(section) {
    sections[section].visible = !sections[section].visible;
  }

  export let metamaskConnect;

  function login() {
    metamaskConnect().catch(e => {
      console.log("Metamask not connected (yet):");
      console.log(e);
    });
  }

</script>

<div class="promo">

  <!-- <h3>General information<span></span></h3> -->

  <div class="inner">




      <img class="icon" src="/apps/zeta/img/zeta_icon.png">
      <div class="token_balance">[ CALCULATING {progressDots} ]</div>

      Basis - underlying YAM balance at block #10650415:
      <br>

        {#if tokenBalance}
          <span class="balance">{tokenBalance.value} YAM</span> [tentative, discussion in progress]
        {:else}
          <span class="balance">0.00</span>
        {/if}

        <br>
        <br>
        <a href="https://zetaseek.com/?q=zeta%20token%20snapshot%20txt&nodes=58743c44ae8ac8076c3c4aac4bdd5052124657c6852fdcceb80488bbbd340920%2C86ff50b0a7d17bc7190242d1f94b464d0e69b31e76a2d6694e374a39e7ebba1d">ZETA TOKEN SNAPSHOT</a> | <a href="https://discord.gg/XvJzmtF">
          JOIN THE DISCUSSION
        </a>


    <p>
      Action required: <span class='action_required'>NONE <span>[ 42 days to go ]</span> </span>
    </p>

    <p>
      <a href="#" class="section_header" on:click|preventDefault={() => { toggleSection('about'); }}>More about this </a>

      <span class="mark" class:section_visible={sections.about.visible}></span>
    </p>

    <section class:visible={sections.about.visible}>
      <p>Token balance will finish calculating before <span class="date">Sep 30 2020</span>.
      <!--   <br><br> Follow the <a href="https://discord.gg/XvJzmtF">Discord server</a>. -->
      </p>

      <p>
        Please read the <a href="https://david.zetaseek.com/file/Zeta%20Snapshot%20Plan.pdf?place=localhost-2f686f6d652f64617669642f446f63756d656e74732f7a6574617365656b">Zeta Token Whitepaper</a>.
      </p>

    </section>

    <!-- <p>
      <a href="#" class="section_header" on:click|preventDefault={() => { toggleSection('why'); }}>Why now?</a>
      <span class="mark" class:section_visible={sections.why.visible}></span>
    </p>

    <section class:visible={sections.why.visible}>
      <p>
        In general <i>everything is changing</i> and improving at this very moment in time. Old ways of sense making and iterating our capabilities are being tested. Giant leaps in sustainability, optimisation and general happiness will be made. One small step at a time. Much progress has already been achieved in recent years and now blocks are coming together.
      </p>
    </section> -->

    <!-- <p>
      <a href="#" class="section_header" on:click|preventDefault={() => { toggleSection('why2'); }}>Towards more decentralized future</a>
      <span class="mark" class:section_visible={sections.why2.visible}></span>
    </p> -->

    <!-- <section class:visible={sections.why2.visible}>
      <p>
        It is not someone else who will take action. You have to do it. Decentralization means less top-down command and control.
        Just look around and see where most help is needed and where you could be most useful.
      </p>

      <p>
        Information has to be understood, new experiments have to be made, conclusions have to be reached and shared, existing digital technology has to be put to better use, new components have to be built, recently developed ones have to be improved, digital and non-digital worlds have to merge further.
      </p>
    </section> -->
  </div>

  <!-- <p class="invite">

    {#if metamaskConnect}
      <a href="#" on:click|preventDefault={() => { login(); }}>
        Login with <img src="/apps/zeta/img/metamask.png" alt="metamask " /> MetaMask
      </a>
    {:else}
      <a href="https://metamask.io">Install <img src="/apps/zeta/img/metamask.png"alt="metamask " />
        MetaMask
      </a>
    {/if}

    to explore current <br> State of the Art and help Plan the Future <span>✓</span>
  </p> -->

</div>

<style>
  .promo {
    /*color: white;*/

    margin-top: 10px;

    padding: 10px;
    /*padding-top: 0;*/
    font-size: 0.8em;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    /*color: #232527;*/
    color: #999;
    /*background-color: #8B7CEA;*/
    /*background-color: #4351A9;*/
    /*background-color: var(--dmt-violet-dark);*/
    /*background-color: var(--dmt-violet-dark);*/

    /*background: rgb(27, 28, 52);
    background: linear-gradient(180deg, rgba(27, 28, 52, 1) 0%, rgba(42, 27, 52, 1) 100%);
    background-attachment: fixed;*/

    width: 400px;

    text-align: justify;
  }

  .promo .icon {
    /*padding-top: 50px;*/
    width: 20px;
  }

  .promo a {
    color: white;
  }

  h2 img {
    width: 90px;
    /*filter: invert(1);*/
  }

  .promo h3 {
    color: var(--dmt-cyan);
    margin-top: 5px;
  }

  .promo span.date {
    color: var(--dmt-cyan);
  }

  .promo .balance {
    color: var(--dmt-cyan);
  }

  .promo h3 span {
    color: #555;
  }

  .promo .section_header {
    font-weight: bold;
  }

  .promo a.section_header {
    /*color: white;*/
    font-weight: bold;
  }

  section {
    display: none;
  }

  span.mark:before {
    content: '▷';
  }

  span.section_visible.mark:before {
    content: '▼';
  }

  section.visible {
    display: block;
  }

  .token_balance {
    color: var(--dmt-orange);
    font-weight: bold;
    padding-bottom: 10px;
  }

  .action_required {
    color: var(--dmt-orange);
    font-weight: bold;
  }

  .action_required span {
    color: #888;
    font-size: 0.8em;
  }

  .invite {
    /*text-align: center;*/
    color: var(--dmt-navy);
    /*background-color: #7FAFB3;
    border-radius: 5px;
    padding: 8px;*/
    line-height: 1.5em;
    /*color: #ECE597;
    color: #D8C2B4;*/
    font-weight: bold;
  }

  .invite img {
    width: 20px;
  }

  .invite a {
    color: var(--dmt-navy);
  }

  .invite a:hover {
    /*color: #F7861C;*/
    color: var(--dmt-navy2);
    opacity: 0.9;
  }

  .invite span {
    color: var(--dmt-navy);
  }

  /*.invite span {
    filter: invert(0.8);
  }*/

  /*.promo .section_header:hover {
    cursor: pointer;
    color: #1F5256;
  }*/

</style>



