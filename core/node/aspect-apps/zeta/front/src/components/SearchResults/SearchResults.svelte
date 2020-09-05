<script>
  import ResultLink from './ResultLink.svelte';
  import ResultSwarm from './ResultSwarm.svelte';
  import ResultFs from './ResultFS.svelte';
  import ResultNote from './ResultNote.svelte';

  import ResultsMetaTop from './ResultsMetaTop.svelte';
  import ResultsMetaBottom from './ResultsMetaBottom.svelte';
  import ZetaExplorersInvite from '../ZetaExplorersInvite.svelte';

  import { getContext } from 'svelte';
  const app = getContext('app');

  export let loggedIn;
  export let searchResults;
  export let noSearchHits;
  export let store;
  export let hasPlayer;
</script>

<div class="no_results" class:visible={noSearchHits}>— NOTHING WAS FOUND —
  <!-- {#if loggedIn}
    (FOR NOW?)
  {:else}
    // <span>PERHAPS TRY TO LOGIN FIRST</span>
  {/if} -->
  <!-- {#if app.isZetaSeek}
    <div class="meta_results">
      <a href="?q=zeta">Read about Zeta project long term vision</a>
      <br>
      <br>
      Next document coming soon:
      <br>
      How to add your node and search results.
    </div>
  {/if} -->


  <!-- <a href="#" on:click|preventDefault={() => { app.emit('explorersClick'); }}>Starting October 30</a> -->
</div>


<div class="no_results" class:visible={noSearchHits}>

  But ... the main purpose of this tech is to allow anyone
  to host <i>their own <b>search node</b></i> (private or public):

</div>

<div class="no_results" class:visible={noSearchHits}>

  <ZetaExplorersInvite />

</div>


<div class="no_results" class:visible={noSearchHits}>

  Please read through these short documents and let us know if you want to participate even before that date.

</div>

<div class="no_results" class:visible={noSearchHits}>
  <a href="mailto:zeta@uniqpath.com">📭 Our email is here.</a>
</div>

<div class="no_results" class:visible={noSearchHits}>
   <a href="https://discord.gg/XvJzmtF"><img class="symbol" src="/apps/zeta/img/discord.svg" /> Discord server is here.</a>
</div>

<div class="no_results" class:visible={noSearchHits}>

  As a validation of our approach we have received a grant from the <a href="https://medium.com/ethereum-swarm/buzz-is-in-the-air-swarm-grants-results-are-in-a030ab9178a9">Swarm Foundation</a>.

</div>

<div class="no_results" class:visible={noSearchHits}>
  Come explore the edges!
  <img class="symbol" src="/apps/zeta/img/zeta_icon.png" />
  <img class="symbol" src="/apps/zeta/img/tropical-fish.png" />
  <img class="swarm symbol" src="/apps/zeta/img/swarm-symbol.png" />
  <img class="symbol" src="/apps/zeta/img/bee.png" />
</div>


<!-- {#if app.isZetaSeek}
  {#if store.searchQuery == 'YAM Finance'}
    <div class="banner">
      <h2>First Zetaseek fairAD™</h2>

      🍠 🍠 🍠 What if everyone involved wrote one page perspective of events in last 24h... What it meant for them, how they used the protocol, what are their feelings about the future of Cryptoeconomic Experimentation! These reports will get nicely organized and easily /searchable/. <br>
      <br>
      <a href="mailto:david@uniqpath.com">✉️ EMAIL YOUR VIEWPOINT HERE ✉️</a> <br><br>
      Or post here: <a href="https://discord.com/invite/XvJzmtF"> <b>#yam-alpha-experience-reports</b> channel</a> on Zeta <img class="icon" src="/apps/zeta/img/discord.svg"> server <br><br>
      <a href="/?q=YAM%20Reports">SUBMITTED REPORTS ARE HERE, ENJOY :) 🍠 🍠 🍠 </a> <br>
      <br>THANK YOU ;)<br>
    </div>
  {:else if store.searchQuery == 'YAM Reports'}
    <div class="banner">
      <h2>Second Zetaseek fairAD™</h2>
      <a href="/?q=YAM%20Finance">HOW TO SUBMIT REPORTS 🍠 🍠 🍠 </a> <br>
      <h3>But why</h3>
      Because this was something special and if you participated you must be special and you probably also want to hear from the others:
      How they see the events of 11.8. to 13.8.2020 and what they learned from them.
      <br>
      <br>
      Who knows what lies ahead?
    </div>
  {:else}
    <div class="banner">
      <h2>About Zetaseek</h2>
      <a href="/?q=zeta">Read about the project</a> <br>
    </div>
  {/if}
{/if} -->

{#if searchResults}
  <!-- {#if app.isZetaSeek} -->
    <!-- <div class="banner" class:visible={!noSearchHits}>
      <h3>About Zetaseek</h3>
      <a href="/?q=zeta">Read about the project</a> <br>
    </div> -->
  <!-- {/if} -->

  {#if searchResults.error}
    <div class="search_error">
      <p>Search Error in Frontend Code:</p>
      <span>{searchResults.error.message}</span>
      <span>{@html searchResults.error.stack.split('\n').join('<br>')}</span>
    </div>
  {:else}
    {#each searchResults as providerResponse}

        <!-- PROVIDER ERROR -->
        {#if providerResponse.error}
          <div class="results">
            <ResultsMetaTop meta={providerResponse.meta}/>

            <div class="result_error">
              Error: <span>{JSON.stringify(providerResponse.error)}</span>
            </div>
          </div>
        {/if}

        <!-- SOME RESULTS (if not results, we omit this provider) -->
        {#if providerResponse.results && providerResponse.results.length > 0}
          <div class="results">
            <ResultsMetaTop meta={providerResponse.meta}/>

            <!-- filePathANSI: not used anymore.. only problems and we needed separation - fileName / directory -->
            {#each providerResponse.results as { filePath, fileName, directory, fileNote, url, title, name, context, linkNote, hiddenContext, githubReference, score, swarmBzzHash, swarmUrl, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty, fileUpdatedAtRelativePretty, isNote, notePreview, noteUrl, noteContents, noteTags, linkTags }, i}
              <div class="result" class:url_result={url}>
                {#if url}
                  <ResultLink {url} {title} {context} {hiddenContext} {linkNote} {score} {linkTags} {githubReference} {store} />
                {:else if swarmBzzHash}
                  <ResultSwarm {name} {playableUrl} {mediaType} {entryType} {prettyTime} {fileSizePretty} {context} {hasPlayer} />
                {:else if filePath}
                  <ResultFs {playableUrl} {mediaType} {fileName} {hasPlayer} prevDirectory={i > 0 ? providerResponse.results[i - 1].directory : null} {directory} {fileSizePretty} {fileUpdatedAtRelativePretty} {fileNote} {swarmUrl} /> <!-- swarmUrl is used for files, new BEE client -->
                {:else if isNote}
                  <ResultNote {noteUrl} {notePreview} {noteTags} />
                {:else}
                  <div class="resultError">Unsupported search results format.</div>
                {/if}
              </div>
            {/each}

            <ResultsMetaBottom {providerResponse}/>
          </div>
        {/if}

    {/each}
  {/if}
{/if}

<style>
  .results {
    padding-top: 5px;
    /*line-height: 1.2em;*/
    font-size: 0.9em;
    width: 100%;
  }

  .results a.button {
    background-color: #ddd;
    border-radius: 2px;
    color: #555;
    padding: 0 2px;
  }

  .results span {
    color: #DDD;
  }

  .result {
    padding: 1px 0;
  }

  .result.url_result {
    padding: 3px 0;
  }

  img.symbol {
    width: 15px;
  }

  img.symbol.swarm {
    filter: invert(1);
  }

  .banner {
    padding: 5px;
    font-size: 0.8em;
    margin-top: 10px;
    width: 500px;
    display: inline-block;
    margin: 0 auto;
    background-color: #6359A6;
    color: #ddd;
    border-radius: 5px;
    text-align: justify;
    display: none;
  }

  .banner.visible {
    display: block;
  }

  .banner h2 {
    /*color: #D26AAF;*/
  }

  .banner a {
    color: yellow;
    text-decoration: underline;
  }

  .banner .icon {
    width: 20px;
  }

  .search_error {
    color: var(--dmt-warning-pink);
    margin-top: 20px;
  }

  .result_error {
    color: var(--dmt-warning-pink);
  }

  .search_error span, .result_error span {
    /*color: #555;*/
    color: white;
    background-color: #ddd;
    background-color: #702E3C;
    padding: 2px;
    line-height: 1.5em;
  }

  :global(.results a) {
    color: white;
    text-decoration: underline;
    text-decoration-style: dotted;
    padding: 0 2px;
  }

  :global(.results a:visited) {
    color: #F695FF;
    color: white;
  }

  :global(.results a:hover) {
    /*color: #FFE8DF;*/
    color: white;
    /*color: var(--dmt-navy);*/
    background-color: #444;
    /*background-color: red;*/
    /*border-radius: 2px;*/
  }

  a.button:hover {
    background-color: white;
    color: black;
    cursor: pointer;
  }

  .no_results {
    display: none;
    padding-top: 20px;
    color: var(--dmt-warning-pink);
  }

  .no_results.visible {
    display: block;
  }

  .no_results span {
    color: var(--dmt-bright-cyan);
  }

  .meta_results {
    padding-top: 5px;
  }

  .meta_results a {
    text-decoration: underline;
    color: var(--dmt-bright-cyan);
  }

  a {
    color: var(--dmt-cyan);
    text-decoration: underline;
  }

  @media only screen and (max-width: 768px) {
    .results {
      font-size: 0.8em;
    }

    .banner {
      width: 100%;
      font-size: 0.7em;
    }
  }
</style>
