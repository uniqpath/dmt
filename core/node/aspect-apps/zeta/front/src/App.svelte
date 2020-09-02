<script>
  import { cssBridge, Escape, executeSearch } from 'dmt-js';

  // http://jillix.github.io/url.js/ (TODO)
  import Url from 'urljs';

  import { onMount, setContext } from 'svelte';
  //import Router from 'svelte-spa-router'

  // import routes from './routes';

  //import { Router, Route, Link } from "svelte-routing";

  import About from './components/About.svelte';
  // import ZetaExplorers from './components/ZetaExplorers.svelte';

  import Login from './components/Login/Login.svelte';
  // import MenuBar from './components/MenuBar/MenuBar.svelte';
  import LeftBar from './components/LeftBar/LeftBar.svelte';

  import Swarm from './components/Swarm/Swarm.svelte';

  import ConnectionStatus from './components/ConnectionStatus.svelte';
  import NodeTagline from './components/NodeTagline.svelte';

  import SearchModeSelector from './components/SearchModeSelector.svelte';
  import SearchResults from './components/SearchResults/SearchResults.svelte';

  import { searchMode } from './testStore.js'

  export let store;
  export let appHelper;
  export let metamaskConnect;

  // needed for router
  //export let url = "";

  setContext('app', appHelper);

  const { isZetaSeek, isLocalhost, isMobile } = appHelper;

  appHelper.on('play', ({ playableUrl }) => {
    console.log(`Loading ${playableUrl} into mpv on localhost ...`);
    store.remoteObject('GUIPlayerObject').call('playUrl', { playableUrl });
  });
  // ---------

  const searchDelay = isLocalhost ? 50 : 70; // 50 : 400  // zetaseek we spare our own resources and let users wait a little bit so they don't trigger a lot of requests

  let isSearching;
  let noSearchHits;

  // if (isZetaSeek) {
  //   cssBridge.setWallpaper('/apps/zeta/wallpapers/hilly_dark_forest_river_fog.jpg');
  // } else {
  //   cssBridge.setWallpaper('/apps/zeta/wallpapers/black_triangles.jpg');
  //}

  const { loginStore } = store;

  $: deviceName = $store.deviceName;
  $: searchResults = $store.searchResults;
  // $: panels = $store.panels;
  $: connected = $store.connected;
  //$: searchMode = $store.searchMode;

  $: controller = $store.controller;
  $: swarm = $store.swarm;
  $: player = $store.player;

  $: ethAddress = $loginStore.ethAddress; // also present in $store but we use it from frontEnd because it's more immediate -> it will work even if backend is currently disonnected
  $: userIdentity = $loginStore.userIdentity;
  $: userName = $loginStore.userName;
  $: loggedIn = $loginStore.loggedIn;
  $: isAdmin = $loginStore.isAdmin; // hmm ...
  $: userTeams = $loginStore.userTeams; // hmm ...

  // duplicate
  $: displayName = userName || userIdentity;

  //this.menuBar = { PANELS: ['Profile', 'My Links'] };
  store.set({ panels: {} });

  //let searchMode; // 0 - public search, 1 - only this node
  // const savedSearchMode = localStorage.getItem('searchMode');
  // if (savedSearchMode) {
  //   store.set({ searchMode: parseInt(savedSearchMode) })
  // } else {
  //   store.set({ searchMode: 0 })
  // }

  let searchQuery;
  let searchNodes = [];

  // read browser query strings

  // TEMPORARY
  //const { pathname } = window.location;

  // siteSection.set(pathname);

  const { q, nodes, error, mode } = Url.parseQuery();

  let errorCode = error;

  if (q) {
    searchQuery = decodeURIComponent(q);
  }

  if (mode) {
    searchMode.set(mode);
    // store.set({ searchMode: mode })
    localStorage.setItem('searchMode', mode);
  }

  // nodes
  // list of node pubkeys separated by comma
  if (nodes) {
    searchNodes = nodes.split(',');
  }

  // FIN

  function updateBrowserQuery() {
    // console.log("temporarily not updating query string in browser")
    // return;

    if (searchQuery) {
      Url.updateSearchParam('q', searchQuery);
    } else {
      Url.updateSearchParam('q'); // delete
    }

    if ($searchMode) {
      Url.updateSearchParam('mode', $searchMode);
    } else {
      Url.updateSearchParam('mode'); // delete
    }

    if (searchNodes.length > 0) {
      Url.updateSearchParam('nodes', searchNodes.join(','));
    } else {
      Url.updateSearchParam('nodes'); // delete
    }
  }

  let searchInput;

  onMount(() => {
    if (!isMobile) { // let's not focus on the mobile, users should see the entire page on first visit... there are more important things on it that search itself! :) Maybe on mobile recommend more stuff instead of typing
      setTimeout(() => {
        // after the input field is hopefully connected (and thus not :disabled... so that focusing the field will work...)
        searchInput.focus();
      }, 1000);
    }

    setTimeout(() => {
      // trigger initial search in case there were query parameters in url
      //
      triggerSearch({ force: true });
    }, 100); // if it is not connected yet, it will retry !
  });

  function searchInputChanged() {
    console.log('searchInputChanged event received, triggering search ...');
    triggerSearch({ userActivated: true });
  }

  function placeSearch(query, { nodes = [], mode = undefined } = {}) {
    searchQuery = query;
    searchNodes = nodes;
    if (mode) {
      searchMode.set(mode);
    }
    setTimeout(() => {
      triggerSearch({ userActivated: true });
    }, 50);
  }

  function triggerSearch({ force = false, userActivated = false } = {}) {
    // BECAUSE IT IS NOT ALWAYS BOUND !! (especially at first load) ... we read it manually ...
    searchQuery = document.getElementById('search_input').value;

    // we have to do this because <svelte head> is static -- only on first load! -- (?)
    if (searchQuery) {
      document.title = `${searchQuery} — zetaseek`;
      if(window.screen.width > 768) {
        document.body.classList.add('darken');
      }
    } else {
      document.body.classList.remove('darken');
      document.title = 'ZetaSeek Engine';
    }

    console.log(`triggerSearch: ${searchQuery}`);

    const remoteObject = store.remoteObject('GUISearchObject');
    const remoteMethod = 'search';

    const searchMetadata = { userIdentity, displayName, ethAddress, searchNodes }; // searchNode -- not yet implemented

    const searchStatusCallback = ({ searching, noHits }) => {
      isSearching = searching;
      noSearchHits = noHits;
    };

    // remove error after first user input
    if (userActivated && errorCode) {
      errorCode = undefined;
      Url.updateSearchParam('error'); // delete
    }

    if (connected) {
      //console.log(`Sending search query: ${searchQuery}`);

      if (searchQuery == null) {
        console.log('Warning: null SEARCH QUERY !!! Should not hapen. There is a bug probably in GUI code');
      }

      updateBrowserQuery();

      // TODO: implement searchNode functionality... and also show in GUI that this search was limited (filtered) to one paricular node
      // show option to search All nodes. !!

      executeSearch({ searchQuery, searchMode: $searchMode, remoteObject, remoteMethod, searchStatusCallback, searchDelay, force, searchMetadata }).then(searchResults => {
        // console.log("SEARCH RESULTS:");
        // console.log(searchResults);
        store.set({ searchResults, searchQuery }); // searchQuery --> only used in search results to show "BANNER"
      }).catch(e => {
        store.set({ searchResults: { error: e } });
      });
    } else if (searchQuery) { // sometimes we get empry searchQuery on first page load (we don't have to report that because it's not a problem... but we should never allow the user to typo into the disconnected field)
      // const error = new Error('Frontend wasn\'t yet connected ... FIX the code, dont send queries yet or then....');
      // store.set({ searchResults: { error } });
      setTimeout(() => {
        triggerSearch();
      }, 500); // OH YEA :) --> we need this for initial load when query parameters were read and search couldn't yet work because it was disconnected
    }
  }

  function goHome() {
    doSearch('');
    if (!isMobile) {
      searchInput.focus();
    }
  }

  function doSearch(query) {
    document.getElementById('search_input').value = query; // clear input field (searchQuery is bound at should change automatically)
    triggerSearch(); // clear search results
  }

  function searchModeChanged() {
    if (!isMobile) {
      searchInput.focus();
    }
    triggerSearch({ userActivated: true });
  }

  function explorersClick() {
    placeSearch('explorers', { mode: 1 });
  }

  $: placeholderText = !connected ? "Search is currently not available" : ($searchMode == 0 ? "Search public network" : "Search this node");

  appHelper.on('search', doSearch);

  // if (!isZetaSeek) {
  //   setTimeout(() => {
  //     if (deviceName) {
  //       document.title = `${deviceName} - search`;
  //     }
  //   }, 800); // hackish!
  // }
</script>

<!-- not useful, does not actually change as searchQuery changes after the initial load... not reactive -->
<!-- we do it by setting document.title instead -->
<!-- <svelte:head>
    {#if searchQuery}
      <title>ZetaSeek Engine · {searchQuery}</title>
    {:else}
      <title>ZetaSeek Engine</title>
    {/if}
</svelte:head> -->

<!-- {#if isLocalhost && deviceName == 'eclipse'} -->

<!-- {#if isLocalhost || loggedIn}
  <MenuBar {connected} {loggedIn} {store} />
{/if} -->

<!-- {JSON.stringify(player)} -->

<!-- <div class="images_preload">
  <img src="/img/zeta_landscape_dark.jpg)">
</div> -->

<!-- {#if (isLocalhost && deviceName == 'eclipse') || isZetaSeek} -->
<!-- {#if app.isLocalhost || loggedIn} -->

<!-- <Route path="explorers" component="{ZetaExplorers}" /> -->

{#if loggedIn}
<!-- {#if isLocalhost || loggedIn} -->
  <LeftBar {connected} {loggedIn} {isAdmin} {metamaskConnect} {displayName} {loginStore} {store} {searchQuery} {deviceName} />
{/if}

<About {isMobile} {searchQuery} />

<main>

  <!-- {#if !isLocalhost || (isLocalhost && deviceName == 'eclipse')} -->
  {#if isZetaSeek}
    <Login {connected} {metamaskConnect} {ethAddress} {displayName} {isAdmin} />
  {/if}

  <!-- {:else}
    <Escape /> -->
  <!-- {/if} -->

  <div class="logo">
    <a href="#" on:click|preventDefault={() => { goHome(); }}>
      <img src={`/apps/zeta/img/ZetaSeek_logo.png?v=2`} alt="zeta logo">
    </a>
  </div>

  <!-- {#if pathname == 'swarm'} -->
    <!-- <Swarm {swarm} /> -->
  <!-- {/if} -->
  <!-- <Router {routes} /> -->

  <!-- <Swarm {swarm} /> -->

  <!-- {isZetaSeek ? 'p2p node' : window.location.hostname} -->
  <ConnectionStatus {connected} {controller} {isSearching} {deviceName} />

  <NodeTagline {connected} {searchResults} {displayName} {loggedIn} on:explorersClick="{explorersClick}" />

  <div class="search">

    <input id="search_input" bind:value={searchQuery} bind:this={searchInput} on:keyup={searchInputChanged} on:paste={searchInputChanged} class:public_search={$searchMode == 0} class:this_node_search={$searchMode == 1} placeholder={placeholderText} disabled={!connected}>

    {#if !connected && isLocalhost}
      <p class="connection_status_help">
        ⚠️ Please start the <span>dmt-proc</span> ...
      </p>
    {/if}

    {#if connected}
      <SearchModeSelector {searchQuery} on:searchModeChanged="{searchModeChanged}" />
    {/if}

    {#if errorCode == 'file_not_found'}
      <br>
      <div class="error">
        ⚠️ Requested file was renamed or moved {#if !noSearchHits} but perhaps one of the following results matches:{/if}
      </div>
    {/if}

    <SearchResults {loggedIn} {searchResults} {noSearchHits} {store} hasPlayer={player && player.volume != undefined} />

  </div>

</main>

<style>
  :root {
    --warning: #E34042;
    --dmt-red: #E34042;
    --dmt-warning-pink: #EFCAF8;
    --dmt-orange: #E5AE34;

    --dmt-navy: #41468F;
    /*--dmt-navy: #199EFF;
    --dmt-navy: #199EFF;*/
    --dmt-navy2: #292C5A;
    --dmt-cyan: #29B3BF;
    /*--dmt-bright-cyan-prev: #3EFFE5;*/
    --dmt-bright-cyan: #3DFFEC;
    --dmt-violet: #873BBF;
    --dmt-violet-dark: #2E1740;

    --dmt-vibrant-green: #5FE02A;
    --dmt-cool-green: #5DF699;
    --dmt-cool-cyan: #51F5C8;
    --dmt-cool-cyan2: #58E288;

    --zeta-green: #31E5C1;
    --zeta-green-highlight: #34FED7;
    --zeta-green_check: #32E6BE;

    --search-input-width: 330px;
  }

	main {
		text-align: center;
		padding: 1em;
    padding-top: 50px;
	}

  /*:global(a) {
    color: white;
    text-decoration: underline;
    text-decoration-style: dotted;
    padding: 0 2px;
  }

  :global(a:visited) {
    color: #F695FF;
    color: white;
  }

  :global(a:hover) {
    color: white;
    background-color: #444;
  }*/

  .logo {
    display: inline-block;
  }

  .logo a {
    font-size: 1.0em;
    /*color: var(--zeta-green);*/
    color: white;
    /*font-family: FiraCode;*/
    /*font-family: Avenir;*/
  }

  .logo:hover {
    opacity: 0.9;
    /*cursor: pointer;*/
  }

  .logo img {
    /*filter: invert(1);*/
    width: 200px;
    margin: 0 auto;
    margin-bottom: 5px;
  }

  .logo a span {
    color: var(--dmt-cool-cyan2);
  }

  .error {
    font-size: 0.8em;
    padding: 2px 4px;
    border-radius: 3px;
    color: var(--dmt-warning-pink);
    display: inline-block;
    margin-top: 20px;
  }

  input#search_input {
    width: var(--search-input-width);
    margin: 0 auto;
    color: #222;
    outline: none;
    border-radius: 20px;
    /*padding: 5px 5px;*/
    padding: 6px 8px;
  }

  input#search_input.public_search {
    background-color: var(--zeta-green);
    border-color: white;
  }

  input#search_input.this_node_search {
    background-color: var(--dmt-navy);
    border-color: white;
    color: white;
  }

  input#search_input.public_search::placeholder {
    /*color: #11867F;*/
    color: #0C615C;
  }

  input#search_input.this_node_search::placeholder {
    color: #6A72FF;
  }

  input#search_input:disabled {
    background-color: var(--dmt-warning-pink);
  }

  input#search_input:disabled, input#search_input:disabled::placeholder {
    color: #A48CAC;
  }

  .search {
    color: white;
  }

  .connection_status_help {
    color: var(--dmt-warning-pink);
    font-size: 1em;
  }

  .connection_status_help span {
    color: var(--zeta-green);
  }

  .zeta_title {
    width: 20px;
  }

  @media only screen and (max-width: 768px) {
    main {
      padding-top: 30px;
    }

    .logo {
      width: 300px;
      font-size: 0.8em;
    }

    .logo img {
      width: 150px;
      margin-bottom: 10px;
    }
  }
</style>
