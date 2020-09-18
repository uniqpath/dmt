<script>
  import ResultTags from '../ResultTags/ResultTags.svelte';

  export let store;

  export let url;
  export let title;
  export let context;
  export let linkNote;
  export let score;
  export let linkTags;
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

  function visit(url) {
    trackClick({ url });
    window.location.href = url;
  }
</script>

<!-- <ResultTags {entryType} {mediaType} resultType="swarm" /> -->

<!-- target="_blank" -->

<div class="entry" on:click={() => visit(url)}>

  {#if linkTags}
    {#each linkTags as tag}
      <!-- for now only "github" and "youtube", see scoreEntry.js in backend -->
      <ResultTags linkTag={tag} />
    {/each}
  {/if}

  <span class="title">{title || ''}
  <!-- <b>{title || '[ no title ]'}</b> -->

  {#if context && !context.startsWith(title)}
    <span class="dot">·</span> <b><span class="context">{context}</span></b>
  {/if}

  <!-- <br> -->

  <a class="website" href="{url}" on:click|preventDefault={() => trackClick({ url })}>
    <span class="url">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
  </a>

  {#if linkNote}
    <div class="link_note">
      <!-- {linkNote} -->
      {@html linkNote.replace('\n', '<br>')}

    </div>
  {/if}

  <!-- <span class="dot">·</span>

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
  </div> -->

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

  /*:global(.result) {
    padding: 10px 0;
  }*/

  .entry {
    display: inline-block;
    padding: 2px 4px;
    border-radius: 5px;
  }

  .entry:hover {
    cursor: pointer;
    background-color: #444;
    /*background-color: #544E63;*/
  }

  .entry:hover a {
    text-decoration: underline;
  }

  /*.entry:not(:last-child) {
    margin-bottom: 7px;
  }*/

  a.toggle_score_info, .score_info {
    color: #DDD;
    font-size: 0.8em;
  }

  a.website {
    /*color: var(--dmt-bright-cyan);*/
    color: white;
  }

  /*a.website:nth-child(odd) {
    background-color: red;
  }*/

  a.website .url {
    /*color: white;*/

    /*color: var(--zeta-green);*/
    color: #bbb;
    color: #C4C6C2;
    color: #76C98F;
    /*color: var(--dmt-warning-pink);*/
  }

  .url {
    font-size: 0.9em;
  }

  /*span.pretty_time {
    color: #DFB1D9;
  }*/

  span.dot {
    color: white;
  }

  span.title {
    color: var(--dmt-bright-cyan);
  }

  span.context {
    color: #aaa;
  }

  .link_note {
    padding-top: 3px;
    font-size: 0.9em;
    color: #ddd;
    width: 500px;
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .link_note {
      font-size: 0.8em;
      width: auto;
    }
  }
</style>
