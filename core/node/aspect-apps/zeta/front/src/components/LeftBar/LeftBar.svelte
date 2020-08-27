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

  $: userIdentity = $loginStore.userIdentity;
  $: userTeams = $loginStore.userTeams;

  $: tokenBalance = $loginStore.tokenBalance; // hmm ...

  import MenuBar from '../MenuBar/MenuBar.svelte';

  import Links from './Links.svelte';
  import Profile from './Profile.svelte';
  import TokenBox from './TokenBox.svelte';
  // import InsideBox from './InsideBox.svelte';
  import TeamBox from './TeamBox.svelte';
  import ZetaDiscord from './ZetaDiscord.svelte';
  import ZetaDocuments from './ZetaDocuments.svelte';

</script>

<!-- this component is only displayed on isLocalhost || loggedIn -->

<div class="leftbar">
  <!-- {#if loggedIn || (!loggedIn && !searchQuery)}
    <Links />
  {/if} -->

  <!-- {#if app.isZetaSeek}
    <TokenBox {metamaskConnect} {tokenBalance} />
  {/if} -->

  <MenuBar {connected} {loggedIn} {store} />

  {#if panels['Profile']}
    <Profile {connected} {loginStore} {store} {isAdmin} />
  {/if}

  <!-- we don't actually need to be connected but ui behaves better (otherwise we see "Info" flashing before userTeams are loaded) -- we now have a shorter flash... between connection and the time until userTeams come from backend -->
    <!-- {#if loggedIn} -->
      <!-- {#if app.isLocalhost || loggedIn} -->
      <!-- {#if (app.isLocalhost && deviceName == 'eclipse') || app.isZetaSeek} -->
        <!-- {/if} -->

        <!-- {#if panels['Swarm Promo']}
          <InsideBox teamName='Swarm' />
        {/if}

        {#if panels['Filecoin Promo']}
          <InsideBox teamName='Filecoin' />
        {/if} -->

        <!-- {#if panels['Zeta Discord']}
          <ZetaDiscord />
        {/if} -->
        <!-- {#if panels['Zeta Documents']}
          <ZetaDocuments />
        {/if} -->
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



