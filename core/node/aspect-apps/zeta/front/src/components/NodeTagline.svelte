<script>
  export let connected;
  export let loggedIn;
  export let searchResults;
  export let displayName;

  import ZetaExplorersInvite from './ZetaExplorersInvite.svelte';

  import { getContext, createEventDispatcher } from 'svelte';
  const app = getContext('app');

  //const dispatch = createEventDispatcher();
</script>

<!-- {#if !isLocalhost && connected && !searchResults} -->

  {#if app.isZetaSeek}
    <div class="tagline">

      <!-- {#if connected && !searchResults} -->
      {#if connected}

        <!-- {#if loggedIn}
          Welcome<span>{displayName ? ` ${displayName}` : ''}</span>, you have found a fine place <span>♪♫♬</span>
        {:else}  -->
        <!-- not logged in -->
          <span>
            <!-- [ -->
              </span>
                <!-- {#if window.location.hostname == 'david.zetaseek.com'}
                  The game is changing.
                {:else if window.location.hostname == 'griff.zetaseek.com'}
                  Buidling the future.
                {:else if window.location.hostname == 'sebastjan.zetaseek.com'}
                  Polymaths shall inherit the Earth. -->


                  <!-- More knowledge, more possibilities. -->
                  <!-- Be part of global solution instead of local problems. -->
                  <!-- Entirely new way of search & discovery -->
                  <!-- <img src="/apps/zeta/img/compass.png" alt="compass" /> -->

                  <ZetaExplorersInvite />


                  <!-- Creativity is a wild mind and a disciplined eye. -->


                <!-- More knowledge, more possibilities. -->
              <span>
            <!-- ] -->
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

        <!-- {/if} -->

      {/if}
    </div>
  {/if}

<style>

.tagline {
  color: var(--zeta-green);
  font-size: 0.8em;
  display: inline-block;
  vertical-align: middle;
  padding: 2px 0;
}

.tagline span {
  color: var(--dmt-cyan);
  color: white;
}


</style>
