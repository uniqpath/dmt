<script>
  export let meta;
</script>

<h3>
  @{meta.providerHost}<span class="contentId">{#if meta.contentId}/{meta.contentId}{/if}</span>

  <!-- {#if !providerResponse.error}
    <span class="searchTime">fs <span class="value">{providerResponse.meta.searchTimePretty}</span>
      {#if providerResponse.meta.networkTimePretty}
        · network <span class="value">{providerResponse.meta.networkTimePretty}</span>
      {/if}
    </span>
  {/if} -->

</h3>

<style>
  h3 span.contentId {
    color: #DDD;
  }
</style>
