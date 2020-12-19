<script>
  import { getContext, createEventDispatcher } from 'svelte';
  const app = getContext('app');

  import { searchMode } from '../testStore.js'

  import SearchModeDiagram from './SearchModeDiagram.svelte';

  export let searchQuery;
  //export let store;

  const dispatch = createEventDispatcher();

  //$: searchMode = $store.searchMode;

  function setSearchMode(mode) {
    searchMode.set(mode);
    //store.set({ searchMode }) // DIDN'T WORK! too slow, reactive argument was not updated in time and triggerSearch function in App.svelte read the old searchMode
    // used readable store instead
    localStorage.setItem('searchMode', mode);
    //updateBrowserQuery();
    dispatch('searchModeChanged');
  }
</script>

<div class="search_mode">
  {#if $searchMode == 0}
    <span class="team_search" on:click={() => setSearchMode(0)} class:active={$searchMode == 0}>
      <!-- {#if $searchMode == 0}↑{/if} -->
      ↑ <b>Peer search</b>
    </span> ·
    <!-- <span class="connectome_search" on:click={() => setSearchMode(1)} class:active={$searchMode == 1}>My Connectome</span> -->
    <span class="this_node_search" on:click={() => setSearchMode(1)} class:active={$searchMode == 1}>
      {#if $searchMode == 1}↑{/if}
      This machine search
    </span>
  {:else}
    <span class="this_node_search" on:click={() => setSearchMode(1)} class:active={$searchMode == 1}>
      <!-- {#if $searchMode == 1}↑{/if} -->
      ↑ <b>This machine search</b>
    </span> ·
    <!-- <span class="connectome_search" on:click={() => setSearchMode(1)} class:active={$searchMode == 1}>My Connectome</span> -->
    <span class="team_search" on:click={() => setSearchMode(0)} class:active={$searchMode == 0}>
      {#if $searchMode == 0}↑{/if}
      Peer search
    </span>
  {/if}

  <!-- {#if !searchQuery}
    <div class="explain" class:public_mode={$searchMode == 0} class:this_node={$searchMode == 1}>

      {#if $searchMode == 0}
        💡 All network peers will receive the search query.
      {:else}
        🦉 Search query is not transmitted to other peers.
      {/if}
    </div>

  {/if} -->

</div>

<!-- {#if !searchQuery}
  <SearchModeDiagram />
{/if} -->

<style>

/*search_mode*/

.search_mode {
  /*margin-top: 20px;*/
  padding-top: 20px;
  width: var(--search-input-width);
  margin: 0 auto;
  font-size: 0.9em;
}

.search_mode span {
  padding: 2px 5px;
  border-radius: 5px;

  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}

.search_mode span:hover {
  cursor: default;
}

/*team_search, this_node_search*/

.search_mode .team_search:not(.active), .search_mode .this_node_search:not(.active) {
  text-decoration: underline;
}

/*.search_mode .team_search.active, .search_mode .this_node_search.active {
  cursor: default;
}*/

.search_mode .team_search:hover:not(.active) {
  color: var(--zeta-green);
  cursor: pointer;
  text-decoration: underline;
 }

.search_mode .this_node_search:hover:not(.active) {
  /*color: var(--dmt-cyan);*/
  /*color: var(--dmt-navy);*/
  color: var(--dmt-cyan);
  color: #BCCCCB;
  cursor: pointer;
  text-decoration: underline;
 }

/*public*/

.search_mode .team_search:hover, .search_mode .team_search.active {
  color: var(--zeta-green);
  /*background-color: var(--zeta-green);
  color: #333;*/
}

/*this_node_search*/

.search_mode .this_node_search:hover, .search_mode .this_node_search.active {
  /*color: var(--dmt-navy);*/
  color: var(--dmt-cyan);
  color: #BCCCCB;
  /*background-color: var(--dmt-navy);*/
}

.search_mode .explain {
  margin-top: 15px;
  color: #ECF0F3;
  font-size: 0.8em;
}

.search_mode .explain span {
  font-size: 0.8em;
}

/*explain*/

.search_mode .explain.public_mode {
  color: var(--zeta-green);
}

.search_mode .explain.this_node {
  color: var(--dmt-bright-cyan);
  /*color: var(--dmt-navy);*/
}

@media only screen and (max-width: 768px) {
  .search_mode .show_diagram, .search_mode .diagram {
    display: none;
  }
}

</style>
