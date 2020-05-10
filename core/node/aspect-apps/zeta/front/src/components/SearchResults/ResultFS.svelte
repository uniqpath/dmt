<script>
  import { ansicolor } from 'dmt-js';

  import ResultTags from './ResultTags.svelte';
  import PlayMedia from './PlayMedia.svelte';

  // use: https://www.rgbtohex.net/hextorgb/
  ansicolor.rgb = {
    black: [0, 0, 0],
    darkGray: [180, 180, 180],
    //cyan: [255, 255, 255]
    cyan:         [37,176,188],
    lightCyan:    [0, 204, 255]
  };

  export let playableUrl;
  export let filePathANSI;

  export let mediaType;
  export let fileSizePretty;
</script>

<ResultTags {mediaType}  />

<a href="{playableUrl}">
  {#each ansicolor.parse(filePathANSI).spans as span}<span style="{span.css}">{span.text}</span>{/each}
</a>

<PlayMedia {playableUrl} {mediaType} />

{#if fileSizePretty}
  <span class="file_size">{fileSizePretty}</span>
{/if}

<style>
  span {
    color: #DDD;
  }

  span.file_size {
    color: #DFB1D9;
  }
</style>
