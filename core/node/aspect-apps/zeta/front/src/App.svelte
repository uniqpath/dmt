<script>
  import { cssBridge, Escape, executeSearch, ansicolor, colorsHTML as colors, mediaTypeIcon } from 'dmt-js';

  import { onMount } from 'svelte';

  import About from './components/About.svelte';
  import Spinner from 'svelte-spinner';

  ansicolor.rgb = {
    black: [0, 0, 0],
    darkGray: [180, 180, 180],
    cyan: [255, 255, 255]
  };

  export let store;

  const isLocalhost = window.location.hostname == 'localhost';
  // ugly hack for now:
  const isZetaSeek = window.location.hostname == 'zetaseek.com';

  let isSearching;
  let noSearchHits;

  if (isZetaSeek) {
    cssBridge.setWallpaper('/apps/zeta/wallpapers/hilly_dark_forest_river_fog.jpg');
  } else {
    cssBridge.setWallpaper('/apps/zeta/wallpapers/black_triangles.jpg');
  }

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
    }, 300); // todo: fix -- handle back inside our app ? then read last results from localstorate ?!
    // when we go back in browser history and search query is kept for us (by default)
    // we need small delay because otherwiser "store" is not yet setup
  });

  function searchInputChanged() {
    const remoteObject = store.remoteObject('GUISearchObject');
    const remoteMethod = 'search';

    const searchStatusCallback = ({ searching, noHits }) => {
      isSearching = searching;
      noSearchHits = noHits;
    };

    if (connected) {
      executeSearch({ searchQuery, remoteObject, remoteMethod, searchStatusCallback, searchDelay: 400 }).then(searchResults => {
        store.set({ searchResults });
      }).catch(e => {
        store.set({ searchResults: { error: e.message } });
      });
    }
  }

  function play(playableUrl) {
    console.log(`Loading ${playableUrl} into mpv on localhost ...`);
    store.remoteObject('GUIPlayerObject').call('playUrl', { playableUrl });
  }

  function displayResultsMeta(providerResponse) {
    if (providerResponse.error) {
      return colors.red(`⚠️  Error: ${providerResponse.error}`);
    }

    const { meta } = providerResponse;
    const { page, noMorePages, resultCount, resultsFrom, resultsTo, searchTimePretty, networkTimePretty } = meta;

    let time = '';

    if (searchTimePretty) {
      time += colors.gray(` · ${colors.gray('fs')} ${colors.white(searchTimePretty)}`);
    }

    if (networkTimePretty) {
      time += colors.gray(` · ${colors.gray('network')} ${colors.white(networkTimePretty)}`);
    }

    if (resultCount > 0) {
      if (page == 1 && noMorePages) {
        return colors.white(`${resultCount} ${resultCount == 1 ? 'result' : 'results'}${time}`);
      }

      const isLastPage = noMorePages ? colors.white(' (last page)') : '';
      const resultsDescription = `${colors.white(`Results ${resultsFrom} to ${resultsTo}`)}`;
      return colors.gray(`${colors.white(`Page ${page}`)}${isLastPage} → ${resultsDescription}${time}`);
    }

    return colors.gray(`No ${page > 1 ? 'more ' : ''}results${time}`);
  }
</script>

<About {store} />

<main>

  {#if isLocalhost}
    <Escape />
  {/if}

  <div class="logo">
    <img src="/apps/zeta/img/zeta_logo.png" alt="zeta logo">
  </div>

  <p class="connection_status" class:ok={connected} class:isLocalhost>
    {#if connected}
      {$store.deviceName || ''} connected:

      {#if isSearching}
        <Spinner id="search_spinner" size="15" speed="400" color="#fff" thickness="2" gap="40"/>
      {:else}
        ✓
      {/if}
    {:else}
      — disconnected —
      <!-- ✖ -->
    {/if}
  </p>

  <div class="search">

    <input id="searchInput" bind:value={searchQuery} bind:this={searchInput} on:keyup={searchInputChanged} on:paste={searchInputChanged} placeholder="Please type your query ...">

    {#if !connected}
      <p class="connection_status_help">
        Operator, please start <span>dmt-proc</span>.
      </p>
    {/if}


    <div class="noResults" class:visible={noSearchHits}>NO RESULTS :( ... Yet ;)</div>

    {#if searchResults}

      {#each searchResults as providerResponse}

        {#if providerResponse.results && providerResponse.results.length > 0}

          <div class="results">
            <!-- @provider/contentId -->
            <h3>
              {providerResponse.meta.providerHost}<span class="contentId">{#if providerResponse.meta.contentId}/{providerResponse.meta.contentId}{/if}</span>

              <!-- {#if !providerResponse.error}
                <span class="searchTime">fs <span class="value">{providerResponse.meta.searchTimePretty}</span>
                  {#if providerResponse.meta.networkTimePretty}
                    · network <span class="value">{providerResponse.meta.networkTimePretty}</span>
                  {/if}
                </span>
              {/if} -->

            </h3>

            {#if providerResponse.error}
              <div class="resultError">
              Error:
                <span>{JSON.stringify(providerResponse.error)}</span>
              </div>
            {:else}
              {#each providerResponse.results as {filePath, name, context, swarmBzzHash, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty}}
                <div class="result">

                  {#if mediaType == 'video'}
                    <span class="tag videoTag">VIDEO</span>
                  {/if}

                  {#if mediaType == 'photo'}
                    <span class="tag imageTag">IMAGE</span>
                  {/if}

                  {#if mediaType == 'pdf'}
                    <span class="tag pdfTag">PDF</span>
                  {/if}

                  {#if swarmBzzHash}
                    <span class="tag swarmTag">SWARM</span>

                    {#if entryType == 'ens'} <!-- hackish + todo: make sure to update hashes from ENS registry!! -->
                      <span class="tag ensTag">ENS</span>
                    {/if}

                    <a href="{playableUrl}">
                      <b>{name}</b>
                    </a>

                    {#if prettyTime}
                      ·
                      {prettyTime}
                    {/if}

                    {#if entryType == 'ens'}
                      ∞
                    {:else}
                      ·
                    {/if}

                    {#if context}
                      {#if entryType != 'ens'}({/if}{context}{#if entryType != 'ens'}){/if}
                    {/if}

                    <!-- <a href="{playableUrl}">
                      {swarmBzzHash}
                    </a> -->
                  {:else if filePath}
                    <a href="{playableUrl}">
                      {#each ansicolor.parse(filePathANSI).spans as span}<span style="{span.css}">{span.text}</span>{/each}
                    </a>
                  {:else}
                    <div class="resultError">Unsupported search results format.</div>
                  {/if}

                  {#if mediaType && mediaTypeIcon(mediaType)}
                    <span class="mediaType">{mediaTypeIcon(mediaType)}</span>
                  {/if}

                  {#if !isZetaSeek && mediaType == 'music'}
                    <a class="button" on:click={() => { play(playableUrl); }}>PLAY</a>
                  {/if}

                  {#if fileSizePretty}
                    <span>{fileSizePretty}</span>
                  {/if}
                </div>
              {/each}

              <div class="results_meta">
                {@html displayResultsMeta(providerResponse)}
              </div>

              {#if providerResponse.meta.pageNumber}
                <div class="results_count">Page: <span>{providerResponse.meta.pageNumber}</span>
                  {#if providerResponse.meta.hasMore}
                    <a href="next_page">Next page</a>
                  {/if}
                </div>
              {/if}

            {/if}
          </div>
        {/if}
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

  .results a.button, .results .tag {
    background-color: #ddd;
    border-radius: 2px;
    color: #555;
    padding: 0 2px;
  }

  .results .swarmTag {
    color: #555;
    background-color: #FFA500;
  }

  .results .ensTag {
    background-color: #5284FF;
    color: white;
  }

  .results .videoTag {
    color: white;
    background-color: #2C581A;
  }

  .results .imageTag {
    color: white;
    background-color: #C76479;
  }

  .results .pdfTag {
    color: white;
    background-color: #575DC9;
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
    color: #41479F;
  }

  p.connection_status.isLocalhost {
    color: #9F4051;
    color: #FEBCBC;
  }

  p.connection_status.ok {
    color: #fff;
  }

  .connection_status_help {
    color: #5DF699;
    font-size: 0.8em;
  }

  .connection_status_help span {
    color: #51F5C8;
  }

  .results {
    padding-top: 5px;
    line-height: 1.2em;
    font-size: 0.8em;
    width: 100%;
  }

  .results .results_count {
    margin-top: 5px;
    font-size: 0.8em;
    color: #CCC;
  }

  .results .results_count span {
    color: white;
  }

  .results h3 span.contentId {
    color: #DDD;
  }

  .results span {
    color: #DDD;
  }

  .results span.searchTime {
    font-size: 0.7em;
    color: #ddd;
  }

  .results span.searchTime span.value {
    color: white;
  }

  .results .results_meta {
    margin-top: 5px;
    font-size: 0.8em;
  }

  .result {
    padding: 3px 0;
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

  .result a {
    color: white;
    text-decoration: underline;
    text-decoration-style: dotted;
    padding: 0 2px;
  }

  .result a:hover {
    /*color: #FFE8DF;*/
    color: #FFA500;
    background-color: #444;
  }

  a.button:hover {
    background-color: white;
    color: black;
    cursor: pointer;
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
