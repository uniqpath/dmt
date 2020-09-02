<script>
  import ResultTag from './ResultTag.svelte';
  import ResultLinkTag from './ResultLinkTag.svelte';

  export let mediaType;
  export let resultType;
  export let entryType;
  export let linkTag;
</script>

{#if mediaType}

  {#if mediaType == 'photo'}
    <ResultTag tag="image" />
  {:else}
    <ResultTag tag={mediaType} />
  {/if}

{/if}

{#if resultType}
  <ResultTag tag={resultType} />
{/if}

{#if linkTag}
  <ResultLinkTag tag={linkTag} />
{/if}

<!-- note results -->

<!-- {#if resultType == 'note'}
  <ResultTag tag="note" />
{/if}
 -->
