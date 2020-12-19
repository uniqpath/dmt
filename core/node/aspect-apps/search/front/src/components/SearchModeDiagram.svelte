<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  import { searchMode } from '../testStore.js'

  let diagramIsVisible = false;

  function toggleDiagram() {
    diagramIsVisible = !diagramIsVisible;

    if(diagramIsVisible && window.screen.width > 768) {
      document.body.classList.add('darken');
    } else {
      document.body.classList.remove('darken');
    }
  }

</script>

<div class="show_diagram">
  <a href="#" on:click|preventDefault={() => { toggleDiagram(); }}>{diagramIsVisible ? 'Hide' : 'Show'} {$searchMode == 0 ? 'first' : 'second'} diagram</a>
</div>

{#if diagramIsVisible}
  <div class="diagram">
    <!-- <div class="explain" class:public_mode={searchMode == 0} class:this_node={searchMode == 1}> -->
    {#if $searchMode == 0}
      <img src="/apps/search/img/zeta_search_queries0.png" alt="zeta_search_query_public" />
    {:else}
      <img src="/apps/search/img/zeta_search_queries1.png" alt="zeta_search_query_this_node" />
    {/if}
  </div>
{/if}

<style>

/*diagram*/

.show_diagram a {
  color: white;
  text-decoration: underline;
}

.show_diagram {
  padding-top: 10px;
  font-size: 0.8em;
}

.diagram img {
  margin-top: 20px;
  width: 300px;
}

/*IMAGE PRELOAD - not sure if it works!*/

after {
  content: url(img/search_queries0.png);
  display: none;
}

.explain:after {
  content: url(img/search_queries1.png);
  display: none;
}


</style>
