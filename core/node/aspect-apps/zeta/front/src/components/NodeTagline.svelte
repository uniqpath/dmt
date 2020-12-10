<script>
  export let connected;
  export let loggedIn;
  export let displayName;

  import ZetaExplorersInvite from './ZetaExplorersInvite.svelte';

  import { getContext, createEventDispatcher } from 'svelte';
  const app = getContext('app');
</script>

  {#if app.isZetaSeek}
    <div class="tagline">
      {#if connected}
        A small step forward <a href="https://dmt-system.com">each friday</a>, big leap each year.
         <!-- <span>♪♫♬</span> -->
      {/if}
    </div>
  {/if}

<style>

.tagline {
  color: var(--zeta-green);
  font-size: 0.8em;
  display: inline-block;
  vertical-align: middle;
  padding: 2px 0 5px 0;
}

.tagline a {
  color: var(--dmt-bright-cyan);
  text-decoration: underline;
}

.tagline a:hover {
  color: var(--dmt-cyan);
}

.tagline span {
  color: var(--dmt-cyan);
  color: white;
}


</style>
