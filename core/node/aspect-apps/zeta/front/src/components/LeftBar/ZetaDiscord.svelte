<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  function toggleSection(section) {
    sections[section].visible = !sections[section].visible;
  }

  let minimized;

  function minimize() {
    minimized = true;
  }

</script>

<div class="promo" class:visible={!minimized}>

  <!-- <a href="#" class="minimize" on:click={() => minimize()}>X</a> -->

  <h3><span>Zeta Discord Community</span></h3>

  <div class="inner">

      <a href="https://discord.gg/XvJzmtF"><img class="icon" src="/apps/zeta/img/discord.svg"><br>JOIN THE DISCUSSION</a>

      <!-- <p>
        This link is almost not promoted (this is more or less the only place), congratulations if you have found it!
      </p> -->

      <p>
        We move slowly but we keep on moving! 🐍
      </p>

      <!-- <p>
        First 100 members get a special NFT token.
      </p> -->

  </div>
</div>

<style>
  .promo {
    color: white;

    margin-top: 10px;

    padding: 10px;
    /*padding-top: 0;*/
    font-size: 0.8em;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    color: #232527;
    background-color: #BAE7EC;

    width: 400px;

    text-align: justify;

    display: none;
  }

  .promo.visible {
    display: block;
  }

  .promo a.minimize {
    float: right;
    font-weight: bold;
    text-decoration-style: dotted
  }

  a:hover {
    opacity: 0.9;
  }

  img.icon {
    width: 140px;
  }

  .promo h3 {
    color: var(--dmt-navy);
    margin-top: 5px;
  }

  .promo h3 span {
    color: #555;
  }

  .promo .section_header {
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

  .invite {
    color: var(--dmt-navy2);
    font-weight: bold;
  }

  .invite span {
    filter: invert(0.8);
  }

  /*.promo .section_header:hover {
    cursor: pointer;
    color: #1F5256;
  }*/

</style>



