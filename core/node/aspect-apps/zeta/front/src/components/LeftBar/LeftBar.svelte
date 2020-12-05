<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let connected;
  export let loggedIn;
  export let isAdmin;

  export let deviceName; // temp
  export let metamaskConnect;
  export let searchQuery;

  export let displayName;

  export let store;

  $: panels = $store.panels;

  export let loginStore;

  import MenuBar from '../MenuBar/MenuBar.svelte';

  import Links from './Links.svelte';
  import Profile from './Profile.svelte';
  // import InsideBox from './InsideBox.svelte';
  // import TeamBox from './TeamBox.svelte';
  // import ZetaDiscord from './ZetaDiscord.svelte';
  // import ZetaDocuments from './ZetaDocuments.svelte';

</script>

<div class="leftbar">
  {#if app.nodeHasBlog}
    <Links blogName={app.blogName} />
  {/if}

  <!-- {#if loggedIn}

    <MenuBar {connected} {loggedIn} {loginStore} />

    {#if panels['Profile']}
      <Profile {connected} {loginStore} {store} {isAdmin} />
    {/if}

  {/if} -->

</div>

<style>
  .leftbar {
    position: absolute;
    top: 0px;
    left: 0px;

    color: white;
  }

  /*.more_inside {
    margin-left: 30px;
  }*/

  :global(.leftbar a) {
    color: #333;
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  :global(.leftbar a:hover) {
    color: #111;
    text-decoration-style: solid;
  }

  :global(.leftbar span.date) {
    color: var(--dmt-violet-dark);
    font-size: 0.9em;
  }

  @media (max-width: 1150px) {
    .leftbar {
      display: none;
    }
  }
</style>



