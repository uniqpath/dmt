<script>
  import ResultTag from './ResultTag.svelte';
  import ResultLinkTag from './ResultLinkTag.svelte';

  export let mediaType = undefined;
  export let resultType = undefined; // Prevent <ResultTags> was created without expected prop 'resultType'
  export let entryType = undefined; // further description: https://stackoverflow.com/questions/58571604/componentname-was-created-without-expected-prop-segment
  export let linkTag = undefined;
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
