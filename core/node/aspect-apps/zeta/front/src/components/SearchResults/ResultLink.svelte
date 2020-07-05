<script>
  import ResultTags from './ResultTags.svelte';

  export let store;

  export let url;
  export let title;
  export let context;
  export let score;
  export let githubReference;

  let scoreInfoVisible;

  function trackClick({ url }) {
    try {
      const remoteObject = store.remoteObject('GUISearchObject');
      remoteObject.call('trackClick', { url });
    } catch(e) {
      console.log(e);
    }

    window.location = url;
  }

  function toggleScoreInfo() {
    scoreInfoVisible = !scoreInfoVisible;
  }
</script>

<!-- <ResultTags {entryType} {mediaType} resultType="swarm" /> -->

<!-- target="_blank" -->

<a href="{url}" on:click|preventDefault={() => trackClick({ url })}>
  <b>{title || url}</b>
  <b>{context}</b>
</a>

<a href="#" class="toggle_score_info" on:click|preventDefault={() => toggleScoreInfo()}>[ result scoring info ]</a>
<div class="score_info" class:visible={scoreInfoVisible}>
  Link Score: {score}
  |
  <a href="{githubReference}">GitHub source for search result</a>
</div>



{#if title} <!-- we don't show url again if we used it as a clickable link because title was not present -->
  <div class="url">{url}</div>
{/if}

<style>
  a {
    text-decoration: underline;
    text-decoration-style: solid; /* external link */
  }

  .score_info {
    display: none;
  }

  .score_info.visible {
    display: block;
    margin: 5px 0;
  }

  a.toggle_score_info, .score_info {
    color: #DDD;
    font-size: 0.8em;
  }

  .url {
    font-size: 0.8em;
  }

  span.pretty_time {
    color: #DFB1D9;
  }

  span.context {
    color: #aaa;
  }
</style>
