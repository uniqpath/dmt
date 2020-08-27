<script>
  import ResultTags from './ResultTags.svelte';

  export let store;

  export let url;
  export let title;
  export let context;
  export let score;
  export let hiddenContext;
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

  {#if url.indexOf('youtube.com') > -1}
    <ResultTags resultType="video" />
  {/if}

  <a class="website" href="{url}" on:click|preventDefault={() => trackClick({ url })}>

    <b>{title || '[ no title ]'}</b>

    {#if context && !context.startsWith(title)}
      <span class="dot">·</span> <b><span class="context">{context}</span></b>
    {/if}

    <br>

    <span class="url">{url}</span>

  </a>

  <span class="dot">·</span>

  <a href="#" class="toggle_score_info" on:click|preventDefault={() => toggleScoreInfo()}>[ Internals ]</a>
  <div class="score_info" class:visible={scoreInfoVisible}>
    Link Score: {score}
    |
    Title: {title}
    |
    Context: {context}
    |
    Hidden context: {hiddenContext}
    |
    <a href="{githubReference}">GH_ref</a>
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

  a.website {
    color: var(--dmt-bright-cyan);
  }

  /*a.website:nth-child(odd) {
    background-color: red;
  }*/

  a.website .url {
    color: white;
  }

  .url {
    font-size: 0.8em;
  }

  a span.context {
    color: var(--dmt-cool-cyan2);
  }

  /*span.pretty_time {
    color: #DFB1D9;
  }*/

  span.dot {
    color: white;
  }

  span.context {
    color: #aaa;
  }
</style>
