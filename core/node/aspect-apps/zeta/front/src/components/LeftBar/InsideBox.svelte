<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  import ResultTag from '../SearchResults/ResultTag.svelte';

  export let teamName;

  const sections = {
    "Swarm": { visible: false }
  };

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

  <h3><span class="swarm_official">{teamName.toUpperCase()}</span> 😎🏖️ <span>Summer Reading Club</span></h3>

  <div class="inner">

    <p>
      <a href="#" class="section_header" on:click|preventDefault={() => { toggleSection('Swarm'); }}>The Book Of Swarm</a>

      <span class="mark" class:section_visible={sections.Swarm.visible}></span>
    </p>

    <section class:visible={sections.Swarm.visible}>
      Get <a href="#" on:click|preventDefault={() => { app.emit('search', 'Book of Swarm pdf'); }}>The Book Of Swarm</a> 📙🐝
      <!-- The Book Of Swarm → <a class="outside" href="https://swarm-gateways.net/bzz:/35810ba9634c3b3978edfd79961dfda2f5a79ec46c3b3c0c8d209c5217318ac5/">download from Swarm p2p network</a> itself. -->

      <p>
        A technical book released on <b>May 18th 2020</b> which serves as a reference for <b>implementation of Swarm clients</b>:
        The <a class="outside" href="https://github.com/ethersphere/bee">Swarm Bee</a> <span class="small">(the next official client to replace the current legacy one)</span> and others.
      </p>
    </section>

    <p>
      <a class="outside" href="https://swarm.ethereum.org">Swarm Project Website</a> or via <!-- <ResultTag tag='ens'/> --> <a href="https://swarm-gateways.net/bzz:/swarm.eth/" class="outside">Swarm gateway</a>
      <br>
      <span class="tagline">Storage and Communication for a Sovereign Digital Society</span>
    </p>

  </div>
</div>

<style>
  .promo {
    margin-top: 10px;

    padding: 10px;
    /*padding-top: 0;*/
    font-size: 0.8em;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;

    color: #382609;
    background-color: #FFAF28;

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

  .promo h3 {
    color: #1C1304;
    margin-top: 5px;
  }

  .promo h3 span {
    color: #555;
  }

  .promo .section_header {
    font-weight: bold;
  }

  a.outside {
    text-decoration: underline;
    text-decoration-style: solid;
  }

  section {
    display: none;
  }

  a.outside:before {
    /*content: '➤ ';*/
  }

  span.mark:before {
    content: '▷';
  }

  span.section_visible.mark:before {
    content: '▼';
  }

  span.swarm_official {
    color: #333333;
  }

  span.small {
    font-size: 0.8em;
  }

  span.tagline {
    color: 354049;
    font-weight: bold;
    font-style: italic;
  }

  section.visible {
    display: block;
  }

  .invite {
    color: var(--dmt-navy2);
    /*color: #ECE597;
    color: #D8C2B4;*/
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



