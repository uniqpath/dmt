<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  const { dmtJS } = app.deps;

  const { ansicolor } = dmtJS;

  import ResultTags from '../ResultTags/ResultTags.svelte';
  import PlayMedia from '../PlayMedia.svelte';

  // use: https://www.rgbtohex.net/hextorgb/
  // ansicolor.rgb = {
  //   black: [0, 0, 0],
  //   // darkGray: [180, 180, 180],
  //   darkGray: [160, 160, 160],
  //   //cyan: [255, 255, 255]
  //   // cyan:         [37, 176, 188],
  //   cyan:         [49, 229, 193],
  //   lightCyan:    [0, 204, 255]
  //   //lightCyan:    [49, 229, 193]
  // };

  export let fileName;
  export let directory;
  export let directoryHandle; // for now because we're on localhost and we omit device key from place specifier!
  export let place;
  export let prevDirectory;

  export let playableUrl;
  //export let filePathANSI;
  export let mediaType;
  export let fileSizePretty;
  export let fileUpdatedAtRelativePretty;
  export let fileNote;
  export let swarmUrl;
  export let hasPlayer;

  export let localResult; // remove when browsePlace is implemented for more than just localhost!

  function browsePlace(place) {
    app.emit('browse_place', place);
  }

</script>

<div class="wrapper">

  {#if directory != prevDirectory} <!-- MEGACOOL! :) -->
    <div class="directory">
      <span class="icon">📁</span>

      <!-- IMPROVE... what about other arguments? we don't need any actually ...  mode etc. ?? -->
      <!-- todo: send place here! in case we want to browse other providers! -->
      {#if localResult}
        <a href={`/?place=${directoryHandle}`} on:click|preventDefault={() => browsePlace(directoryHandle)}>
          {directory}
        </a>
      {:else}
        {directory}
      {/if}

    </div>
  {/if}

  <div class="entry">

    <ResultTags {mediaType}  />

    <a href="{playableUrl}">
      {fileName}
    </a>

    <PlayMedia {playableUrl} {mediaType} {hasPlayer} />

    {#if swarmUrl}
      <a class="swarm_url" href="{swarmUrl}">[ VIA SWARM ]</a>
    {/if}

    {#if fileSizePretty}
      <span class="file_size">{fileSizePretty}</span>
    {/if}

    {#if fileUpdatedAtRelativePretty}
      <span class="file_updated_at">⏱️ <span>{fileUpdatedAtRelativePretty}</span></span>
    {/if}

    {#if fileNote}
      →
    {/if}

    {#if fileNote}
      <div class="file_note"><a href="{playableUrl}">{fileNote}</a></div>
    {/if}

  </div>

</div>

<style>
  span {
    color: #EEE;
  }

  span.file_size {
    color: #DFB1D9;
  }

  span.file_updated_at {
    color: #eee;
    font-size: 0.9em;
  }

  span.file_updated_at span {
    color: #A4ACE0;
  }

  .wrapper {
    display: inline-block;
  }

  .directory {
    padding: 0px 2px 2px 2px;

    color: #222;
    background-color: var(--zeta-green);
    background-color: #DC8FEF;
    background-color: #3B9496;

    margin-top: 10px;
    margin-bottom: 10px;

    border-radius: 4px;

    display: inline-block;
  }

  .directory .icon {
    /*display: inline-block;*/
    /*vertical-align: middle;*/
    /*padding-top: 2px;*/
    /*float: left;*/
  }

  .directory:hover {
    opacity: 0.8;
  }

  .directory a {
    color: #eee;
  }

  .entry {
    border-radius: 5px;
    padding: 0px 4px;
  }

  .entry:hover {
    /* DUPLICATE*/
    background-color: #444; /* same as for links defined in SearchResults.svelte */
  }

  a.swarm_url {
    color: #FFAF28;
  }

  a.swarm_url:hover {
    color: #444;
    background-color: #FFAF28;
  }

  .file_note {
    width: 500px;
    margin: 0 auto;
    color: #C4D9DC;
    text-align: justify;
    font-size: 0.9em;
    margin-bottom: 7px;
    padding-top: 3px;
    padding-bottom: 5px;
    border-bottom: 1px dotted #C4D9DC;
  }

  .file_note a {
    text-decoration: none;
  }

  @media only screen and (max-width: 768px) {
    .file_note {
      font-size: 0.7em;
      width: 100%;
      padding-left: 5px;
      padding-right: 5px;
    }
  }
</style>
