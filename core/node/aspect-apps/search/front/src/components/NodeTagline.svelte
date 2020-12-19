<script>
  export let connected;
  export let loggedIn;
  export let displayName;

  import ZetaExplorersInvite from './ZetaExplorersInvite.svelte';

  import { getContext } from 'svelte';
  const app = getContext('app');
</script>

  {#if app.isZetaSeek}
    <div class="tagline">
      {#if $connected}
        <!-- A small step forward <a href="https://dmt-system.com">each friday</a>, big leap each year. -->
        <!-- <a href="https://dmt-system.com">Zeta Open Hours</a>  -->
        It's early!
        · <a on:click|preventDefault={() => app.emit('browse_place', '2f686f6d652f7a6574612f46696c65732f444d542d53595354454d2f50726573656e746174696f6e73' )} href="#">DMT ENGINE</a> ·

        <!-- · <a on:click|preventDefault={() => app.emit('browse_place', '2f55736572732f64617669642f4d6973632f5a6574614c6f63616c546573745365617263682f4d757369632f4d6574616c6c696361202d2031393931202d2054686520426c61636b20416c62756d' )} href="#">DMT ENGINE</a> -->

        <a on:click|preventDefault={() => app.emit('node_search', 'post social media' )} href="#"> Post-Social Media</a>
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
