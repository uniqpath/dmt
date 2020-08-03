<script>
  import ResultTags from './ResultTags.svelte';

  export let store;

  export let url;
  export let title;
  export let context;
  export let score;
  export let githubReference;

  const { loginStore } = store;

  $: ethAddress = $loginStore.ethAddress; // also present in $store but we use it from frontEnd because it's more immediate -> it will work even if backend is currently disonnected
  $: userIdentity = $loginStore.userIdentity;
  $: userName = $loginStore.userName;
  // duplicate
  $: displayName = userName || userIdentity;

  let scoreInfoVisible;

  function trackClick({ url }) {
    const { host } = window.location;

    const clickMetadata = { userIdentity, displayName, ethAddress, host };

    try {
      const remoteObject = store.remoteObject('GUISearchObject');
      remoteObject.call('trackClick', { url, clickMetadata });
    } catch(e) {
      console.log(e);
    }

    window.location = url;

    // setTimeout(() => {
    //   window.location = url;
    // }, 2000);
  }

  function toggleScoreInfo() {
    scoreInfoVisible = !scoreInfoVisible;
  }
</script>

<!-- <ResultTags {entryType} {mediaType} resultType="swarm" /> -->

<!-- target="_blank" -->


<a href="{url}" on:click|preventDefault={() => trackClick({ url })}>
  {#if title} <!-- we don't show url again if we used it as a clickable link because title was not present -->
    <span class="url">{url}</span> ·
  {/if}

  <b>{title || url}</b>
  <b>{context}</b>
</a>

<a href="#" class="toggle_score_info" on:click|preventDefault={() => toggleScoreInfo()}>[ scoring info ]</a>
<div class="score_info" class:visible={scoreInfoVisible}>
  Link Score: {score}
  |
  <a href="{githubReference}">GitHub source for search result</a>
</div>


<style>
  a {
    text-decoration: underline;
    text-decoration-style: dotted;
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
