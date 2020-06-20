<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  import DisplayLoggedInInfo from './DisplayLoggedInInfo.svelte';
  import DisplayMetamaskInvite from './DisplayMetamaskInvite.svelte';

  export let connected;
  export let metamaskConnect;
  export let ethAddress;
  export let displayName;
  export let isAdmin;

  function login() {
    metamaskConnect().catch(e => {
      console.log("Metamask not connected (yet):");
      console.log(e);
    });
  }

</script>

{#if ethAddress}
  <DisplayLoggedInInfo {connected} {ethAddress} {displayName} {isAdmin} {metamaskConnect} />
  <!-- <svg id="eth_address"></svg> -->
{:else}
  {#if metamaskConnect}
    <div class="login" on:click|preventDefault={() => { login(); }}>
      <a href="#">
        <img src="/apps/zeta/img/metamask.png" on:click|preventDefault={() => { login(); }} alt="metamask " />
      </a>
      <br>
      <b>CONNECT</b>
      {#if app.isZetaSeek}
        <div class="explain">
          <span>
            We invite you to the path of enjoyable exploration and collaborative innovation.
          </span>
        </div>
      {/if}
    </div>
  {:else}
    <DisplayMetamaskInvite />
  {/if}
{/if}

<style>
  .login {
    position: absolute;
    /*top: 15px;*/
    top: 0;
    right: 0px;

    color: white;

    cursor: pointer;
  }

  .login img {
    width: 120px;
    padding: 5px 20px;
  }

  .login .explain {
    width: 230px;
    padding: 0 10px;
  }

  .explain {
    margin-top: 10px;
    color: #ddd;
    font-size: 0.7em;
  }

  .explain span {
    /*color: var(--dmt-bright-cyan);*/
    color: var(--dmt-cool-green);
  }

  .login:hover {
    opacity: 0.9;
    cursor: pointer;
  }

  @media (max-width: 812px) {
    .login {
      display: none;
    }
  }
</style>



