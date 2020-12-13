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
      {#if $connected}
        <!-- A small step forward <a href="https://dmt-system.com">each friday</a>, big leap each year. -->
        <!-- <a href="https://dmt-system.com">Zeta Open Hours</a>  -->
        It's early!
        · <a href="http://zetaseek.com/file/dmt-engine%20and%20connectome%20-%20dmt%20meetup%20-%20dec%202020.pdf?place=localhost-2f686f6d652f7a6574612f46696c65732f444d542d53595354454d2f50726573656e746174696f6e73">DMT ENGINE</a> · <a href="https://zetaseek.com/?q=post%20social%20media&mode=1">Post-Social Media</a>
        <!-- A small step forward <a href="https://dmt-system.com">each friday</a>, big leap each year. -->
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
