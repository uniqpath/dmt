<script>
  import { ansicolor } from 'dmt-js';

  import ResultTags from './ResultTags.svelte';
  import PlayMedia from './PlayMedia.svelte';

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
  export let prevDirectory;

  export let playableUrl;
  //export let filePathANSI;
  export let mediaType;
  export let fileSizePretty;
  export let fileNote;
  export let swarmUrl;
  export let hasPlayer;
</script>

<div class="wrapper">

  {#if directory != prevDirectory} <!-- MEGACOOL! :) -->
    <div class="directory">{directory}</div>
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
      {#if fileNote}
        →
      {/if}
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

  .directory {
    padding: 2px 4px;

    color: #222;
    background-color: var(--zeta-green);

    margin-top: 10px;
    margin-bottom: 10px;

    border-radius: 2px;
  }

  .wrapper {
    display: inline-block;
  }

  .entry {
    border-radius: 5px;
    padding: 0px 4px;
  }

  .entry:hover {
    background-color: #444; /* same as for links defined in SearchResults.svelte */
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

  a.swarm_url {
    color: #FFAF28;
  }

  a.swarm_url:hover {
    color: #444;
    background-color: #FFAF28;
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
