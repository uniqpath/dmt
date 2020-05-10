<script>
  import { cssBridge, Escape, executeSearch } from 'dmt-js';

  import { onMount, setContext } from 'svelte';

  import About from './components/About.svelte';
  import Login from './components/Login.svelte';
  import ConnectionStatus from './components/ConnectionStatus.svelte';
  import SearchResults from './components/SearchResults/SearchResults.svelte';

  export let store;
  export let appHelper;
  export let metamask;

  setContext('app', appHelper);

  const { isZetaSeek, isLocalhost } = appHelper

  appHelper.on('play', ({ playableUrl }) => {
    console.log(`Loading ${playableUrl} into mpv on localhost ...`);
    store.remoteObject('GUIPlayerObject').call('playUrl', { playableUrl });
  });
  // ---------

  const searchDelay = isLocalhost ? 50 : 70;  // 50 : 400  // zetaseek we spare our own resources and let users wait a little bit so they don't trigger a lot of requests

  let isSearching;
  let noSearchHits;

  // if (isZetaSeek) {
  //   cssBridge.setWallpaper('/apps/zeta/wallpapers/hilly_dark_forest_river_fog.jpg');
  // } else {
  //   cssBridge.setWallpaper('/apps/zeta/wallpapers/black_triangles.jpg');
  //}

  $: deviceName = $store.deviceName;
  $: searchResults = $store.searchResults;
  $: connected = $store.connected;

  let searchQuery = '';

  let searchInput;

  onMount(() => {
    searchInput.focus();
    setTimeout(() => {
      searchQuery = document.getElementById('search_input').value;
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
      executeSearch({ searchQuery, remoteObject, remoteMethod, searchStatusCallback, searchDelay }).then(searchResults => {
        store.set({ searchResults });
      }).catch(e => {
        store.set({ searchResults: { error: e.message } });
      });
    }
  }
</script>

<svelte:head>
  {#if isZetaSeek}
    <title>ZetaSeek</title>
  {:else}
    <title>Search</title>
  {/if}
</svelte:head>

<About />

<main>

  {#if isLocalhost}
    {#if deviceName == 'eclipse'}
      <Login {metamask} />
    {:else}
      <Escape />
    {/if}
  {/if}

  <div class="logo">
    <img src={`/apps/zeta/img/${isZetaSeek ? 'zeta_demo' : 'search'}_logo.png`} alt="zeta logo">
  </div>

  <ConnectionStatus {connected} {isSearching} {deviceName} />

  <div class="search">

    <input id="search_input" bind:value={searchQuery} bind:this={searchInput} on:keyup={searchInputChanged} on:paste={searchInputChanged} placeholder="Please type your query ...">

    {#if !connected}
      <p class="connection_status_help">
        Please start <span>dmt-proc</span>.
      </p>
    {/if}

    <SearchResults {searchResults} {noSearchHits} />

  </div>

</main>

<style>
  :root {
    --warning: #E34042;
    --dmt-red: #E34042;
    --dmt-orange: #E5AE34;

    --dmt-navy: #41468F;
    --dmt-cyan: #29B3BF;
    --dmt-bright-cyan: #3EFFE5;
    --dmt-violet: #873BBF;

    --dmt-vibrant-green: #5FE02A;
  }

	main {
		text-align: center;
		padding: 1em;
    padding-top: 80px;
	}

  .logo img {
    filter: invert(1);
    width: 200px;
    margin: 0 auto;
    margin-bottom: 20px;
  }

  input#search_input {
    width: 330px;
    margin: 0 auto;
    color: #222;
    outline: none;
  }

  .search {
    color: white;
  }

  .connection_status_help {
    color: #5DF699;
    font-size: 0.8em;
  }

  .connection_status_help span {
    color: #51F5C8;
  }

  @media only screen and (max-width: 768px) {
    main {
      padding-top: 30px;
    }

    .logo img {
      width: 150px;
      margin-bottom: 10px;
    }
  }
</style>
