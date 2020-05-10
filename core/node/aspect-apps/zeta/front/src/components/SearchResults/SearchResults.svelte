<script>
  import ResultSwarm from './ResultSwarm.svelte';
  import ResultFs from './ResultFS.svelte';
  import ResultNote from './ResultNote.svelte';

  import ResultsMetaTop from './ResultsMetaTop.svelte';
  import ResultsMetaBottom from './ResultsMetaBottom.svelte';

  export let searchResults;
  export let noSearchHits;
</script>

<div class="noResults" class:visible={noSearchHits}>NO HITS</div>

{#if searchResults}

  {#if searchResults.error}
    <div class="search_error">
      <p>General Search Error:</p>
      <span>{JSON.stringify(searchResults.error)}</span>
    </div>
  {:else}
    {#each searchResults as providerResponse}

      <div class="results">

        <!-- PROVIDER ERROR -->
        {#if providerResponse.error}
          <ResultsMetaTop meta={providerResponse.meta}/>

          <div class="result_error">
            Error: <span>{JSON.stringify(providerResponse.error)}</span>
          </div>
        {/if}

        <!-- SOME RESULTS (if not results, we omit this provider) -->
        {#if providerResponse.results && providerResponse.results.length > 0}
          <ResultsMetaTop meta={providerResponse.meta}/>

          {#each providerResponse.results as {filePath, name, context, swarmBzzHash, mediaType, entryType, prettyTime, filePathANSI, playableUrl, fiberContentURL, fileSizePretty, isNote, notePreview, noteUrl, noteContents, noteTags}}
            <div class="result">
              {#if swarmBzzHash}
                <ResultSwarm {name} {playableUrl} {mediaType} {entryType} {prettyTime} {context} />
              {:else if filePath}
                <ResultFs {playableUrl} {mediaType} {filePathANSI} {fileSizePretty} />
              {:else if isNote}
                <ResultNote {noteUrl} {notePreview} {noteTags} />
              {:else}
                <div class="resultError">Unsupported search results format.</div>
              {/if}
            </div>
          {/each}

          <ResultsMetaBottom {providerResponse}/>
        {/if}

      </div>
    {/each}
  {/if}
{/if}

<style>
  .results {
    padding-top: 5px;
    /*line-height: 1.2em;*/
    font-size: 0.8em;
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
    padding: 3px 0;
  }

  .search_error {
    margin-top: 20px;
  }

  .search_error span, .result_error span {
    /*color: #555;*/
    color: white;
    background-color: #ddd;
    background-color: #702E3C;
    padding: 2px;
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

  @media only screen and (max-width: 768px) {
    .results {
      font-size: 0.6em;
    }
  }
</style>
