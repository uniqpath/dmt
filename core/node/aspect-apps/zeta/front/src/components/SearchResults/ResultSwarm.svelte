<script>
  import ResultTags from './ResultTags.svelte';
  import PlayMedia from './PlayMedia.svelte';

  export let playableUrl;
  export let name;
  export let prettyTime;
  export let entryType;
  export let mediaType;
  export let context;
</script>

<ResultTags {entryType} {mediaType} resultType="swarm" />

<a href="{playableUrl}">
  <b>{name}</b>
</a>

{#if prettyTime}
  ·
  <span class="pretty_time">{prettyTime}</span>
{/if}

{#if context}
  {#if entryType == 'ens'}
    ∞
  {:else}
    ·
  {/if}

  <span class="context">{#if entryType != 'ens'}({/if}{context}{#if entryType != 'ens'}){/if}</span>
{/if}

<PlayMedia {playableUrl} {mediaType} />

<style>
  a {
    text-decoration: underline;
    text-decoration-style: solid; /* external link */
  }

  span.pretty_time {
    color: #DFB1D9;
  }

  span.context {
    color: #aaa;
  }
</style>
