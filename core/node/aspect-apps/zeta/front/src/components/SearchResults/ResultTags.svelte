<script>
  import ResultTag from './ResultTag.svelte';

  export let mediaType;
  export let resultType;
  export let entryType;
</script>

<!-- FS and soon swarm results can have these: -->

{#if mediaType == 'video'}
  <ResultTag tag="video" />
{/if}

{#if mediaType == 'photo'}
  <ResultTag tag="image" />
{/if}

{#if mediaType == 'pdf'}
  <ResultTag tag="PDF" />
{/if}

{#if mediaType == 'music'}
  <ResultTag tag="music" />
{/if}

<!-- swarm results -->

{#if resultType == 'swarm'}
  <ResultTag tag="swarm" />
{/if}

{#if entryType == 'ens'} <!-- only Swarm -- hackish + todo: make sure to update hashes from ENS registry!! -->
  <ResultTag tag="ens" />
{/if}

<!-- note results -->

{#if resultType == 'note'}
  <ResultTag tag="note" />
{/if}

