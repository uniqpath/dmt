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

  <h3><span>Zeta Token Distribution Whitepaper</span></h3>

  <div class="inner">

      <a href="https://david.zetaseek.com/file/Zeta%20Snapshot%20Plan.pdf?place=localhost-2f686f6d652f64617669642f446f63756d656e74732f7a6574617365656b"><img class="banner" src="/apps/search/img/zeta_snapshot_whitepaper_preview.jpg">
      <!-- <a href="https://zetaseek.com/?q=zeta"><img class="banner" src="/apps/search/img/zeta_banner.png"> -->
        <br>

      <!-- Read pdf documents searchable via Zeta engine itself.</a> -->

      <!-- <p>
        This link is almost not promoted (this is more or less the only place), congratulations if you have found it!
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

  img.banner {
    width: 400px;
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



