<script>

  import { getContext } from 'svelte';
  const app = getContext('app');

  export let isMobile;
  export let searchQuery;
  export let dmtVersion;

  $: displayVersion = dmtVersion || '';

</script>

  <div class="about" class:visible={!searchQuery} class:wider={app.isLocalhost}>

    <!-- <p> -->
      <!-- {#if app.isLocalhost} -->
        <div class="tagline">
          <!-- Seek the wolf in thyself! -->
          <a href="https://dmt-system.com">Help invent the future</a>
        </div>
      <!-- {/if} -->

      {#if app.isCorePromoter}
        <a href="https://twitter.com/zetaseek"><img class="icon_symbol" src="/apps/search/img/twitter.svg" /></a>
      {/if}

      <span class="version">{displayVersion}</span>
    <!-- </p> -->

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
  width: 130px;
  position: fixed;
  right: 0;
  bottom: 0;
  padding: 15px 10px;
  color: white;
  font-size: 0.8em;
  opacity: 0.8;
  border-top-left-radius: 10px;
  color: #232527;
  background-color: #A4938B;
  background-color: #D9EBD5;
  display: none;
  text-align: center;
}

.about.wider {
  width: 150px;
}

.about.visible {
  display: block;
}

.about p {
  font-size: 0.9em;
  color: #232527;
}

.about img.icon_symbol {
  width: 20px;
  vertical-align: middle;
  padding-bottom: 3px;
}

.about span.dash {
  padding: 0 2px;
}

.about span.version {
  font-size: 0.8em;
}

.about .tagline {
  margin-bottom: 3px;
  font-size: 0.9em;
}

a {
  color: white;
  color: #373D76;
  text-decoration: underline;
  text-underline-offset: 4px;
}

a:hover {
  color: #222;
  text-underline-offset: 2px;
}

a img:hover {
  opacity: 0.8;
}

a img.icon {
  width: 20px;
}

p.explorers {
  font-size: 1.1em;
}

p span.fish {
  font-size: 1.5em;
}

@media only screen and (max-width: 768px) {
  /*.about { }*/
}

</style>
