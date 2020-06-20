<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let displayName;
  export let teamName;

  const sections = {
    "PeterGloor": { visible: false }
  };

  function toggleSection(section) {
    sections[section].visible = !sections[section].visible;
  }

</script>

<div class="promo">

  <h3>{displayName} <span>⬌</span> {teamName} 😎🏖️ <span>Summer Reading Club</span></h3>

  <div class="inner">

    <p>
      <a href="#" class="section_header" on:click|preventDefault={() => { toggleSection('PeterGloor'); }}>Collaborative Innovation Networks </a>

      <span class="mark" class:section_visible={sections.PeterGloor.visible}></span>
    </p>

    <section class:visible={sections.PeterGloor.visible}>
      <p>
        <a href="#" on:click|preventDefault={() => { app.emit('search', 'Peter Gloor'); }}>Peter Gloor's books on collaborative innovation</a>
      </p>

      Especially recommended: <a href="#" on:click|preventDefault={() => { app.emit('search', 'Peter Gloor Coolfarming'); }}>Coolfarming</a>

      <p>
        Why is it that Apple products are cool? Why is Steve Jobs cool? What if you could become cool, too? And what if you could make your own ideas cool? What if you could even turn them into the next big thing?
      </p>

      <!-- <p>
        The good news is, there are indeed steps you can take to be cool, and to convert your ideas into a cool trend. This book addresses the basic questions of what the magic of cool is. It shows you how to “coolfarm” your ideas, how to make trends cool, and how to become cool yourself.
      </p> -->
    </section>

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
    background-color: #8EEFA2;

    width: 400px;

    text-align: justify;
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



