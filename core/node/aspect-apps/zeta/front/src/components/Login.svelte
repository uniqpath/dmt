<script>
  import { onMount } from 'svelte';

  export let metamaskConnect;
  export let ethAddress;
  export let userIdentity;
  export let isAdmin;

  function login() {
    metamaskConnect().catch(e => {
      console.log("Metamask not connected (yet):");
      console.log(e);
    });
  }

  onMount(() => {
    // todo: http://snapsvg.io/
    // included in index.html
    // if (ethAddress) {
    //   var s = Snap("#eth_address");
    //   // Lets create big circle in the middle:
    //   var bigCircle = s.circle(60, 60, 20);
    //   // By default its black, lets change its attributes
    //   bigCircle.attr({
    //     fill: "#bada55",
    //     stroke: "#000",
    //     strokeWidth: 5
    //   });
    // }
  });

</script>

{#if ethAddress}
  <!-- <svg id="eth_address"></svg> -->
  <div id="eth_identity">
    HI {#if userIdentity}
      {userIdentity}

      {#if isAdmin}
        (admin)
      {/if}
      [<span>{ethAddress}</span>]
    {:else}
      <span>{ethAddress}</span>
    {/if}
  </div>
{:else}
  {#if metamaskConnect}
    <div class="login">
      <a href="#">
        <img src="/apps/zeta/img/metamask.png" on:click|preventDefault={() => { login(); }} alt="metamask " />
      </a>
      <br>
      <b>CONNECT</b>
    </div>
  {:else}
    <div class="metamask_missing">
      Install <a href="https://metamask.io">MetaMask</a> extension to login.
      <div class="explain">
        MetaMask provides the simplest yet most secure way to connect to decentralized applications. You are always in control when interacting on the new decentralized web.
      </div>
      <a href="https://metamask.io"> <img src="/apps/zeta/img/metamask.png" alt="metamask" /> </a>
    </div>
  {/if}
{/if}

<style>
  .login {
    position: absolute;
    /*top: 15px;*/
    top: 0;
    right: 0px;

    color: white;
  }

  .login img {
    width: 120px;
    padding: 5px 20px;
  }

  .metamask_missing {
    color: white;

    position: absolute;
    top: 0;
    right: 0;

    padding: 20px;
    width: 300px;
  }

  .metamask_missing a {
    /*color: var(--metamask-orange);*/
    color: #99DDDD;
  }

  .metamask_missing:hover {
    opacity: 0.9;
  }

  .metamask_missing .explain {
    margin-top: 10px;
    color: #ddd;
    font-size: 0.7em;
  }

  .metamask_missing img {
    width: 200px;
  }

  #eth_identity {
    color: white;
    font-size: 0.8em;

    position: absolute;
    top: 15px;
    top: 0;
    right: 0px;
    /*width: 300px;*/
    padding: 10px;
  }

  #eth_identity span {
    color: var(--dmt-bright-cyan);
  }

  .login:hover {
    opacity: 0.9;
  }

  @media (max-width: 812px) {
    .login, .metamask_missing {
      display: none;
    }
  }
</style>



