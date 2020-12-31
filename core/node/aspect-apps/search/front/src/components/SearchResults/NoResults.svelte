<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let noSearchHits;
  export let searchMode;
</script>

<div class="no_results" class:visible={noSearchHits}>
  — NO RESULTS —

  {#if $searchMode == 1}
    <br>
    <br>
    Perhaps try Peer Search as well.
  {/if}

  {#if app.isZetaSeek}

    {#if $searchMode != 1}
      <br>
      <br>
      <img class="symbol" src="/apps/search/img/freezing-face.png" alt="rocket">
      <br><br>
      <span>OH MY, WHAT TO SAY? Perhaps try coming back around March 2021.</span>
      <br><br>
      At least 6,219,111 more entries will be present by then.
      <br><br>
      <span>And these will be <b>Great Entries</b>.</span>
      <br>
      <img class="divider" src="/apps/search/img/connectome_divider.png" alt="rocket">
      <br>
      <span>Perhaps you can <i>like</i> some of them in a proper decentralized way too. Why not, it'll be Fun.</span>
      <br><br>
      <span>It's a way to show fellow humans what you appreciate the most in this World. You are fully in control of this datastream.</span>
      <br><br>
      What can you do until then? <span>It is obvious:</span> Install and learn the basics of <a href="https://metamask.io">METAMASK</a> pseudo-identity solution. <span>This will come really handy.</span>
      <br><br>
      <span>[ You can ignore the entire blockchain part for now. Zero tokens works just fine. ]</span>

    {/if}
  {/if}


</div>

<style>
  .no_results {
    display: none;
    padding-top: 20px;
    color: var(--dmt-warning-pink);
  }

  .no_results img.symbol {
    width: 100px;
  }

  .no_results img.divider {
    width: 200px;
    margin: 30px 0;
  }

  .no_results a {
    color: white;
    text-decoration: underline;
  }

  .no_results a:hover {
    opacity: 0.8;
  }

  .no_results span {
    font-size: 0.8em;
    color: #ddd;
  }

  .no_results.visible {
    display: block;
  }
</style>
