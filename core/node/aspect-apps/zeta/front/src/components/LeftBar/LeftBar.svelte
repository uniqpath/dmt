<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let connected;
  export let loggedIn;

  export let deviceName; // temp
  export let metamaskConnect;
  export let searchQuery;

  export let displayName;

  export let store;

  $: panels = $store.panels;

  export let loginStore;

  $: userIdentity = $loginStore.userIdentity;
  $: userTeams = $loginStore.userTeams;

  import MenuBar from '../MenuBar/MenuBar.svelte';

  import Links from './Links.svelte';
  import Profile from './Profile.svelte';
  import PromoBox from './PromoBox.svelte';
  import InsideBox from './InsideBox.svelte';
  import TeamBox from './TeamBox.svelte';
  import ZetaDiscord from './ZetaDiscord.svelte';
  import ZetaDocuments from './ZetaDocuments.svelte';

</script>

<div class="leftbar">
  <!-- {#if loggedIn || (!loggedIn && !searchQuery)}
    <Links />
  {/if} -->

  <!-- <PromoBox {metamaskConnect} /> -->

  <!-- we don't actually need to be connected but ui behaves better (otherwise we see "Info" flashing before userTeams are loaded) -- we now have a shorter flash... between connection and the time until userTeams come from backend -->

    <!-- {#if loggedIn} -->

      <!-- {#if app.isLocalhost || loggedIn} -->

        <MenuBar {connected} {loggedIn} {store} />

      <!-- {#if (app.isLocalhost && deviceName == 'eclipse') || app.isZetaSeek} -->
        {#if app.isLocalhost || loggedIn}
          {#if panels['Profile']}
            <Profile {connected} {loginStore} {store} />
          {/if}
        {/if}

        {#if panels['Swarm Promo']}
          <!-- <Profile {connected} {loginStore} {store} /> -->
          <InsideBox teamName='Swarm' />
        {/if}

        {#if panels['Zeta Discord']}
          <ZetaDiscord />
        {/if}

        {#if panels['Zeta Documents']}
          <ZetaDocuments />
        {/if}
      <!-- {/if} -->
        <!-- {#if connected}
          {#if userTeams && userTeams.includes('zeta')} --- todo -- one teambox for each team
            <TeamBox {displayName} teamName='ZetaTeam' />
          {/if}
          <InsideBox teamName='Swarm' />
        {/if} -->
      <!-- {/if} -->
    <!-- {:else if !searchQuery} -->

    <!-- {/if} -->

    <!-- {#if !app.isLocalhost && !loggedIn} -->
    <!-- <p class="more_inside">
      More inside
    </p> -->
    <!-- {/if} -->

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



