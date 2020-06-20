<script>
  import ResultTag from './ResultTag.svelte';

  export let mediaType;
  export let resultType;
  export let entryType;
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

<!-- note results -->

<!-- {#if resultType == 'note'}
  <ResultTag tag="note" />
{/if}
 -->
