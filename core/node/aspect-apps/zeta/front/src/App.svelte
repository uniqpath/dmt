<script>
  import { cssBridge, Escape, executeSearch, ansicolor, mediaTypeIcon } from 'dmt-js';

  import { onMount } from 'svelte';

  import About from './components/About.svelte';
  import Spinner from 'svelte-spinner';

  ansicolor.rgb = {
    black: [0, 0, 0],
    darkGray: [180, 180, 180],
    cyan: [255, 255, 255]
  };

  export let store;

  let isSearching;
  let noSearchHits;

  cssBridge.setWallpaper('/wallpapers/landscape/foggy_forest.jpg');

  $: searchResults = $store.searchResults;
  $: connected = $store.connected;
  $: document.title = $store.deviceName || document.title;

  let searchQuery = '';

  let searchInput;

  onMount(() => {
    searchInput.focus();
    setTimeout(() => {
      searchQuery = document.getElementById('searchInput').value;
      searchInputChanged();
    }, 300);
  });

  function searchInputChanged() {
    const remoteObject = store.remoteObject('GUISearchObject');
    const remoteMethod = 'search';

    const searchStatusCallback = ({ searching, noHits }) => {
      isSearching = searching;
      noSearchHits = noHits;
    };

    if (connected) {
      executeSearch({ searchQuery, remoteObject, remoteMethod, searchStatusCallback }).then(searchResults => {
        store.set({ searchResults });
      }).catch(e => {
        store.set({ searchResults: { error: e.message } });
      });
    }
  }
</script>

<About {store} />

<main>

  {#if window.location.hostname == 'localhost'}
    <Escape />
  {/if}

  <div class="logo">
    <img src="/img/zeta_logo.png" alt="zeta logo">
  </div>

  <p class="connection_status" class:ok={connected}>
    {$store.deviceName || ''} connected:

    {#if connected}
      {#if isSearching}
        <Spinner id="search_spinner" size="15" speed="400" color="#fff" thickness="2" gap="40"/>
      {:else}
        ✓
      {/if}
    {:else}
      ✖
    {/if}
  </p>

  <div class="search">

    <input id="searchInput" bind:value={searchQuery} bind:this={searchInput} on:keyup={searchInputChanged} on:paste={searchInputChanged} placeholder="Please type your query ...">

    <div class="noResults" class:visible={noSearchHits}>NO RESULTS :(</div>

    {#if searchResults}

      {#each searchResults as providerResponse}

        <div class="results">
          <h3>{providerResponse.meta.providerHost}</h3>

          {#if providerResponse.error}
            <div class="resultError">
            Error:
              <span>{JSON.stringify(providerResponse.error)}</span>
            </div>
          {:else}
            {#each providerResponse.results as {filePath, mediaType, filePathANSI, fiberContentURL, fileSizePretty}}
              <div class="result">
                <a href="{fiberContentURL}">{#each ansicolor.parse(filePathANSI).spans as span}<span style="{span.css}">{span.text}</span>{/each}</a>

                <span class="mediaType">{mediaTypeIcon(mediaType)}</span>

                <span>{fileSizePretty}</span>
              </div>
            {:else}
              NO RESULTS
            {/each}
          {/if}
        </div>

      {/each}
    {/if}

  </div>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
    padding-top: 80px;
	}

  .logo img {
    filter: invert(1);
    width: 200px;
    margin: 0 auto;
    margin-bottom: 30px;
  }

  #searchInput {
    outline: none;
    width: 330px;
    margin: 0 auto;
  }

  .search {
    color: white;
  }

  p.connection_status {
    color: #777;
  }

  p.connection_status.ok {
    color: #fff;
  }

  .results {
    padding-top: 5px;
    line-height: 1.2em;
    font-size: 0.8em;
    width: 100%;
  }

  .results span {
    color: #DDD;
  }

  .result {
    padding: 3px 0;
  }

  .result a {
    color: white;
  }

  .resultError span {
    color: #555;
    background-color: #ddd;
    padding: 2px;
  }

  .result .mediaType {
    opacity: 0.7;
    color: white;
  }

  .result a:hover {
    color: #FFE8DF;
  }

  .noResults {
    display: none;
    padding: 10px 0;
  }

  .noResults.visible {
    display: block;
  }

  input {
    width: 300px;
    color: #222;
  }

  @media only screen and (max-width: 768px) {
    main {
      padding-top: 30px;
    }

    .logo img {
      width: 150px;
      margin-bottom: 10px;
    }

    .results {
      font-size: 0.6em;
    }
  }
</style>
