<script>
  export let meta;
</script>

<div class="provider_host" class:this={meta.thisMachine}>
  <!-- {JSON.stringify(meta)} -->
  <span class="info">
    Results from
    <!-- {meta.providerAddress == "localhost" ? "" : "p2p node"} -->
  </span>
  <!-- for now localhost device does not provide providerTag (not injected in Zeaseek backend search) -->
  <span class="host">@{meta.providerTag}</span><span class="contentId">
    {#if meta.contentId}
      /{meta.contentId}
    {/if}
  </span>

  <!-- {#if !providerResponse.error}
    <span class="searchTime">fs <span class="value">{providerResponse.meta.searchTimePretty}</span>
      {#if providerResponse.meta.networkTimePretty}
        · network <span class="value">{providerResponse.meta.networkTimePretty}</span>
      {/if}
    </span>
  {/if} -->

</div>

<style>
  .provider_host {
    padding: 5px 20px;
    font-size: 1.2em;
    /*color: white;*/

    margin-top: 20px;
    margin-bottom: 10px;

    border-radius: 5px;

    /*border: 1px solid var(--zeta-green);*/
    background-color: #2EE5C1;
    display: inline-block;

    color: #444;
  }

  .provider_host.this {

    background-color: #BCCCCB;
  }

  .info {
    /*color: var(--dmt-cool-cyan);*/
    font-size: 0.9em;
  }

  .host {
    /*color: var(--dmt-bright-cyan);*/
    color: #222;
  }

  .provider_host.this .host {
    /*color: var(--dmt-cool-green);*/
  }

  .contentId {
    /*color: #DDD;
    color: var(--dmt-cool-cyan);*/
    color: #444;
  }

  .provider_host.this .contentId {

  }
</style>
