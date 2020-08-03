<script>
  import { cssBridge, Escape, executeSearch } from 'dmt-js';

  // http://jillix.github.io/url.js/ (TODO)
  import Url from 'urljs';

  import { onMount, setContext } from 'svelte';

  import About from './components/About.svelte';
  import Login from './components/Login/Login.svelte';
  // import MenuBar from './components/MenuBar/MenuBar.svelte';
  import LeftBar from './components/LeftBar/LeftBar.svelte';
  import ConnectionStatus from './components/ConnectionStatus.svelte';
  import SearchResults from './components/SearchResults/SearchResults.svelte';

  export let store;
  export let appHelper;
  export let metamaskConnect;

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

  let searchQuery;

  searchQuery = Url.parseQuery().q;

  let errorCode;
  errorCode = Url.parseQuery().code;

  if (searchQuery) {
    searchQuery = decodeURIComponent(searchQuery);
  }

  // HACK but some platofrms need this to work properly -- for example opening a link from discord

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

  function placeSearch(query) {
    searchQuery = query;
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
    } else {
      document.title = 'zetaseek engine';
    }

    console.log(`triggerSearch: ${searchQuery}`);

    const remoteObject = store.remoteObject('GUISearchObject');
    const remoteMethod = 'search';

    const searchMetadata = { userIdentity, displayName, ethAddress };

    const searchStatusCallback = ({ searching, noHits }) => {
      isSearching = searching;
      noSearchHits = noHits;
    };

    // remove error after first user input
    if (userActivated && errorCode) {
      errorCode = undefined;
      Url.updateSearchParam('code'); // delete
    }

    if (connected) {
      //console.log(`Sending search query: ${searchQuery}`);

      if (searchQuery == null) {
        console.log('Warning: null SEARCH QUERY !!! Should not hapen. There is a bug probably in GUI code');
      }

      if (searchQuery) {
        Url.updateSearchParam('q', searchQuery);
      } else {
        Url.updateSearchParam('q'); // delete
      }

      executeSearch({ searchQuery, remoteObject, remoteMethod, searchStatusCallback, searchDelay, force, searchMetadata }).then(searchResults => {
        // console.log("SEARCH RESULTS:");
        // console.log(searchResults);
        store.set({ searchResults });
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
  }

  function doSearch(query) {
    document.getElementById('search_input').value = query; // clear input field (searchQuery is bound at should change automatically)
    triggerSearch(); // clear search results
  }

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
      <title>zetaseek engine · {searchQuery}</title>
    {:else}
      <title>zetaseek engine</title>
    {/if}
</svelte:head> -->

<!-- {#if isLocalhost && deviceName == 'eclipse'} -->

<!-- {#if isLocalhost || loggedIn}
  <MenuBar {connected} {loggedIn} {store} />
{/if} -->

<!-- {#if (isLocalhost && deviceName == 'eclipse') || isZetaSeek} -->
{#if isLocalhost || isZetaSeek}
  <LeftBar {connected} {loggedIn} {metamaskConnect} {displayName} {loginStore} {store} {searchQuery} {deviceName} />
{/if}

<!-- (isLocalhost && deviceName == 'eclipse') -->
<!-- {#if (isLocalhost && deviceName == 'eclipse') || (isZetaSeek && (!isMobile || (isMobile && !searchQuery)))} -->
<!-- !searchQuery && -->
<!-- as a test on dev machine and on zetaseek but on mobile only if there are no search results -->
<!-- {#if ((isLocalhost && deviceName == 'eclipse') || (isZetaSeek && (!isMobile || (isMobile && !searchQuery))))} -->
<About {isMobile} />
<!-- {/if} -->

<main>

  <!-- {#if !isLocalhost || (isLocalhost && deviceName == 'eclipse')} -->
  {#if isZetaSeek}
    <Login {connected} {metamaskConnect} {ethAddress} {displayName} {isAdmin} />
  <!-- {:else}
    <Escape /> -->
  {/if}

  <div class="logo">
    <a href="#" on:click|preventDefault={() => { goHome(); }}>
      <!-- <img src={`/apps/zeta/img/${isZetaSeek ? 'zetaseek' : 'search'}_logo.png`} alt="zeta logo"> -->
      {#if isZetaSeek}
        <img src={`/apps/zeta/img/zetaseek_logo.png?v=2`} alt="zeta logo">
      {:else if isLocalhost}
        <span>— </span><!-- <img src={`/apps/zeta/img/zeta_icon.png?v=2`} style="width: 30px; margin-bottom: 0;" alt="zeta logo"> --> SEARCH <span>—</span><!-- 🔬 --><!-- <img src="/apps/zeta/favicon.png" style="width: 100px;"> -->
      {:else}
        <span></span>{window.location.hostname}<span></span>
      {/if}
    </a>
  </div>

  <ConnectionStatus {connected} {isSearching} {deviceName} />

  <div class="search">

    <input id="search_input" bind:value={searchQuery} bind:this={searchInput} on:keyup={searchInputChanged} on:paste={searchInputChanged} placeholder="Please type your query ..." disabled={!connected}>

    {#if !connected && isLocalhost}
      <p class="connection_status_help">
        Please start <span>dmt-proc</span>.
      </p>
    {/if}

    {#if !isLocalhost && connected && !searchResults}
      <p class="connection_status_help">
        {#if loggedIn}
          Welcome<span>{displayName ? ` ${displayName}` : ''}</span>, you have found a fine place <span>♪♫♬</span>
        {:else} <!-- not logged in -->
          <!-- The secret realm awaits. -->
          <!-- <img src="/favicon.png" width="15px">  -->
          {#if window.location.hostname == 'david.zetaseek.com'}
            Welcome to my engine.
          {:else if window.location.hostname == 'griff.zetaseek.com'}
            [ Buidling the future ]
          {:else if window.location.hostname == 'sebastjan.zetaseek.com'}
            [ Polymaths shall inherit the Earth ]
          {:else}
            More knowledge, more possibilities.
          {/if}
          <!-- See further, do more. -->
        {/if}
      </p>
    {/if}

    <!-- SECTION TO EXTRACT -->

    {#if isZetaSeek}
      <div class="search_suggestions">
        <span class="info">Try ≡</span>
        <!-- todo: improve duplication here!! -->
        <!-- <a href="#" on:click|preventDefault={() => placeSearch('Three Types of People')}>Three Types of People</a> <span>·</span> -->
        <!-- <a href="#" on:click|preventDefault={() => placeSearch('gpt3')}>GPT3</a> <span>·</span> -->
        <a href="#" on:click|preventDefault={() => placeSearch('DeFi')}>DeFi</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('NFT')}>NFT</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Swarm Bee')}>Swarm Bee</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Modern Renaissance')}>Modern Renaissance</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Eth Scaling')}>Eth Scaling</a>
        <!-- <a href="#" on:click|preventDefault={() => placeSearch('Astropilot')}>Astropilot ♪♫♬</a> <span>·</span> -->
        <!-- <a href="#" class="special" on:click|preventDefault={() => placeSearch('Zeta')}>Zeta</a> -->
      </div>
    {/if}

    {#if errorCode == 'file_not_found'}
      <br>

      <div class="error">
        ⚠️ Requested file was renamed or moved {#if !noSearchHits} but perhaps one of the following results matches:{/if}
      </div>
    {/if}

    <SearchResults {loggedIn} {searchResults} {noSearchHits} {store} />

  </div>

</main>

<style>
  :root {
    --warning: #E34042;
    --dmt-red: #E34042;
    --dmt-warning-pink: #EFCAF8;
    --dmt-orange: #E5AE34;

    --dmt-navy: #41468F;
    --dmt-navy2: #292C5A;
    --dmt-cyan: #29B3BF;
    --dmt-bright-cyan: #3EFFE5;
    --dmt-violet: #873BBF;
    --dmt-violet-dark: #2E1740;

    --dmt-vibrant-green: #5FE02A;
    --dmt-cool-green: #5DF699;
    --dmt-cool-cyan: #51F5C8;
    --dmt-cool-cyan2: #58E288;

    /*--zeta-green: #1CE6C1;*/
    --zeta-green: #31E5C1;
  }

	main {
		text-align: center;
		padding: 1em;
    padding-top: 60px;
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
    font-size: 2.5em;
    color: var(--zeta-green);
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
    margin-bottom: 20px;
  }

  .logo a span {
    color: var(--dmt-cool-cyan2);
  }

  .error {
    font-size: 0.8em;
    padding: 2px 4px;
    border-radius: 3px;
    /*background-color: var(--dmt-warning-pink);
    color: #333;*/
    color: var(--dmt-warning-pink);
    display: inline-block;
    margin-top: 20px;
  }

  input#search_input {
    width: 330px;
    margin: 0 auto;
    color: #222;
    outline: none;
  }

  input#search_input:disabled {
    background-color: var(--dmt-warning-pink);
  }

  .search {
    color: white;
  }

  .connection_status_help {
    /*color: var(--dmt-cool-green);*/
    color: var(--zeta-green);
    font-size: 0.8em;
  }

  .connection_status_help span {
    color: var(--dmt-cool-cyan);
  }

  .search_suggestions {
    margin-top: 20px;
    font-size: 0.8em;
    /*color: var(--zeta-green);*/
    /*color: var(--dmt-cool-cyan);*/
    /*color: var(--dmt-orange);*/
  }

  .search_suggestions, .search_suggestions a {
    color: #A0A9D4;
  }

  .search_suggestions a.special {
    /*color: var(--dmt-cool-cyan);*/
    /*color: var(--zeta-green);*/
    color: white;
  }

  .search_suggestions a {
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  .search_suggestions a:hover {
    text-decoration-style: solid;
  }

  .search_suggestions .info {
    color: var(--dmt-warning-pink);
  }

  .search_suggestions span {
    color: white;
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
