<script>
  export let connected;
  export let loggedIn;
  export let searchResults;
  export let displayName;
</script>

<!-- {#if !isLocalhost && connected && !searchResults} -->

  <p class="tagline">

    {#if connected && !searchResults}

      {#if loggedIn}
        Welcome<span>{displayName ? ` ${displayName}` : ''}</span>, you have found a fine place <span>♪♫♬</span>
      {:else} <!-- not logged in -->
        <span>
          [
            </span>
              {#if window.location.hostname == 'david.zetaseek.com'}
                The game is changing.
              {:else if window.location.hostname == 'griff.zetaseek.com'}
                Buidling the future.
              {:else if window.location.hostname == 'sebastjan.zetaseek.com'}
                Polymaths shall inherit the Earth.
              {:else}
                More knowledge, more possibilities.
              {/if}

              <!-- More knowledge, more possibilities. -->
            <span>
          ]
          <!-- ·
          <a href="">Project Status</a> -->
        </span>

        <!-- {#if window.location.hostname == 'david.zetaseek.com'}
          Welcome to my engine.
        {:else if window.location.hostname == 'griff.zetaseek.com'}
          [ Buidling the future ]
        {:else if window.location.hostname == 'sebastjan.zetaseek.com'}
          [ Polymaths shall inherit the Earth ]
        {:else}
          More knowledge, more possibilities.
        {/if} -->

      {/if}

    {/if}
  </p>

<style>

.tagline {
  color: var(--zeta-green);
  font-size: 0.8em;
}

.tagline span {
  color: var(--dmt-cyan);
  color: white;
}

a {
  color: var(--dmt-cyan);
  text-decoration: underline;
}

</style>
