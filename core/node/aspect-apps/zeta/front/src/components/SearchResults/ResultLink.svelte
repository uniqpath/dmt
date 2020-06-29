<script>
  import ResultTags from './ResultTags.svelte';

  export let url;
  export let title;
  export let context;
</script>

<!-- <ResultTags {entryType} {mediaType} resultType="swarm" /> -->

<a href="{url}">
  <b>{title || url}</b>
  <b>{context}</b>
</a>
<br>

{#if title} <!-- we don't show url again if we used it as a clickable link because title was not present -->
  <span>{url}</span>
{/if}

<style>
  a {
    text-decoration: underline;
    text-decoration-style: solid; /* external link */
  }

  span {
    font-size: 0.8em;
  }

  span.pretty_time {
    color: #DFB1D9;
  }

  span.context {
    color: #aaa;
  }
</style>
