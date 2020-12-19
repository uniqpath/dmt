

<!-- {#if isZetaSeek}
      <div class="search_suggestions">
        <span class="info">Try ≡</span>
        <a href="#" on:click|preventDefault={() => placeSearch('DeFi')}>DeFi</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('NFT')}>NFT</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Swarm Bee')}>Swarm Bee</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Modern Renaissance')}>Modern Renaissance</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Eth Scaling')}>Eth Scaling</a> <span>·</span>
        <a href="#" on:click|preventDefault={() => placeSearch('Zeta -TXT', ['58743c44ae8ac8076c3c4aac4bdd5052124657c6852fdcceb80488bbbd340920', '86ff50b0a7d17bc7190242d1f94b464d0e69b31e76a2d6694e374a39e7ebba1d'])}>Zeta <img class="zeta_title" src="/apps/search/img/experiment.png"></a>
      </div>
    {/if} -->

<style>

.search_suggestions {
    margin-top: 20px;
    font-size: 0.8em;
    /*color: var(--zeta-green);*/
    /*color: var(--dmt-cool-cyan);*/
    /*color: var(--dmt-orange);*/
  }

  .search_suggestions, .search_suggestions a {
    color: #A0A9D4;
  }

  .search_suggestions a.special {
    /*color: var(--dmt-cool-cyan);*/
    /*color: var(--zeta-green);*/
    color: white;
  }

  .search_suggestions a {
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  .search_suggestions a:hover {
    text-decoration-style: solid;
  }

  .search_suggestions .info {
    color: var(--dmt-warning-pink);
  }

  .search_suggestions span {
    color: white;
  }

</style>
