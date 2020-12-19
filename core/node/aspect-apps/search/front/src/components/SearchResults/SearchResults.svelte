<script>
  import ResultLink from './ResultTypes/ResultLink.svelte';
  import ResultSwarm from './ResultTypes/ResultSwarm.svelte';
  import ResultFs from './ResultTypes/ResultFS.svelte';
  import ResultNote from './ResultTypes/ResultNote.svelte';

  import ResultsMetaTop from './ResultsMetaTop.svelte';
  import ResultsMetaBottom from './ResultsMetaBottom.svelte';
  import ZetaExplorersInvite from '../ZetaExplorersInvite.svelte';

  import { getContext } from 'svelte';
  const app = getContext('app');

  import { searchMode, searchResponse } from '../../testStore.js'

  const { dmtJS } = app.deps;

  $: searchError = $searchResponse.searchError;
  $: searchResults = $searchResponse.searchResults;

  export let loggedIn;
  export let noSearchHits;
  export let backend;
  export let loginStore;
  export let hasPlayer;
</script>

<div class="no_results" class:visible={noSearchHits}>
  {#if app.isZetaSeek}
    — THIS IS A DEMO —
    <br><br> <!-- <span>Please reboot some computer and try again.</span> -->
    <!-- <span>Have you tried turning the {#if $searchMode == 0}network{:else}machine{/if} off and on again?</span> </div> <!-- 🎃 -->
    <!-- <span>Have you tried turning the {#if $searchMode == 0}network{:else}machine{/if} off and on again?</span> </div> <!-- 🎃 -->
    <span class="line">This <b>engine</b> works best as <a href="https://github.com/uniqpath/info">local-first service</a>.</span>
    <span class="line">You can also join a regular weekly <a href="https://dmt-system.com">discourse about next steps</a>.</span>
    <br>
    <br>
    Version 1.0 of ZetaSeek is not yet released.
    <br>
    <br>
    This demo is a decentralized app build on top of <a href="http://zetaseek.com/file/dmt-engine%20and%20connectome%20-%20dmt%20meetup%20-%20dec%202020.pdf?place=localhost-2f686f6d652f7a6574612f46696c65732f444d542d53595354454d2f50726573656e746174696f6e73">DMT ENGINE 1.1</a>

  {:else}
    — NO RESULTS —
  {/if}
</div>


<!-- {#if app.isZetaSeek}
  <div class="no_results" class:visible={noSearchHits}>
    <ZetaExplorersInvite />
  </div>

  <div class="no_results" class:visible={noSearchHits}>
    Come explore the edges!
    <img class="symbol" src="/apps/search/img/zeta_symbol.png" />
    <img class="symbol" src="/apps/search/img/tropical_fish.png" />
    <img class="swarm symbol" src="/apps/search/img/swarm-symbol.png" />
    <img class="symbol" src="/apps/search/img/bee.png" />
  </div>
{/if} -->


<!-- {#if searchResults} -->

  {#if searchError}
    <div class="search_error">
      <p>Search Error in Frontend Code:</p>
      <span>{searchError.message}</span>
      <span>{@html searchError.stack.split('\n').join('<br>')}</span>
    </div>
  {:else if searchResults}
    {#each searchResults as providerResponse}

        <!-- PROVIDER ERROR -->
        <!-- {#if providerResponse.error}
          <div class="results">
            <ResultsMetaTop meta={providerResponse.meta}/>

            <div class="result_error">
              Error: <span>{JSON.stringify(providerResponse.error)}</span>
            </div>
          </div>
        {/if} -->

        <!-- SOME RESULTS (if not results, we omit this provider) -->
        {#if providerResponse.results && providerResponse.results.length > 0}
          <div class="results">
            <ResultsMetaTop meta={providerResponse.meta}/>

            <!-- filePathANSI: not used anymore.. only problems and we needed separation - fileName / directory -->
            {#each providerResponse.results as { filePath, fileName, directory, directoryHandle, place, fileNote, url, title, name, context, linkNote, hiddenContext, githubReference, score, swarmBzzHash, swarmUrl, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty, fileUpdatedAtRelativePretty, isNote, notePreview, noteUrl, noteContents, noteTags, linkTags }, i}
              <div class="result" class:url_result={url}>
                {#if url}
                  <ResultLink {url} {title} {context} {hiddenContext} {linkNote} {score} {linkTags} {githubReference} {backend} {loginStore} />
                {:else if swarmBzzHash}
                  <ResultSwarm {name} {playableUrl} {mediaType} {entryType} {prettyTime} {fileSizePretty} {context} {hasPlayer} />
                {:else if filePath}
                  <ResultFs {playableUrl} {mediaType} {fileName} {hasPlayer} prevDirectory={i > 0 ? providerResponse.results[i - 1].directory : null} {directory} {directoryHandle} {place} {fileSizePretty} {fileUpdatedAtRelativePretty} {fileNote} {swarmUrl} localResult={providerResponse.meta.providerAddress == 'localhost'} /> <!-- swarmUrl is used for files, new BEE client -->
                {:else if isNote}
                  <ResultNote {noteUrl} {notePreview} {noteTags} />
                {:else}
                  <div class="resultError">Unsupported search results format.</div>
                {/if}
              </div>
            {/each}

            <ResultsMetaBottom {providerResponse} />
          </div>
        {/if}

    {/each}
  {/if}
<!-- {/if} -->

<style>
  .results {
    padding-top: 5px;
    /*line-height: 1.2em;*/
    font-size: 0.9em;
    width: 100%;
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

  .no_results {
    display: none;
    padding-top: 20px;
    color: var(--dmt-warning-pink);
  }

  .no_results span {
    font-size: 0.8em;
    color: #ddd;
  }

  .no_results.visible {
    display: block;
  }

  a {
    color: var(--dmt-cyan);
    text-decoration: underline;
  }

  @media only screen and (max-width: 768px) {
    .results {
      font-size: 0.8em;
    }
  }
</style>
