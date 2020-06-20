<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

</script>

<div class="metamask_missing">
  Install <a href="https://metamask.io">MetaMask</a> extension to login.
  <div class="explain">
    MetaMask provides the simplest yet most secure way to connect to decentralized applications. You are always in control when interacting on the new decentralized web.
  </div>

  <div class="explain">
    <span class="green">
      [ <a href="https://swarm-gateways.net/bzz:/0df387857246f1e70d89cd5f0e0be587f6a939bdf7c5b40f435a559f563aa292">Watch MetaMask explainer video via p2p</a> ]
    </span>
  </div>

  <a href="https://metamask.io"> <img src="/apps/zeta/img/metamask.png" alt="metamask" /> </a>

  {#if app.isZetaSeek}
    <div class="explain">
      When you login with truly revolutionary MetaMask identity, you get to know more about this project as well.
      <br><br>
      <span>
        We invite you to the path of enjoyable exploration and collaborative innovation.
      </span>
      <span class="cyan">
        To live is to know.
      </span>
    </div>
  {/if}
</div>

<style>
  .metamask_missing {
    color: white;

    position: absolute;
    top: 0;
    right: 0;

    padding: 20px;
    width: 310px;
  }

  .metamask_missing a {
    /*color: var(--metamask-orange);*/
    color: #99DDDD;
    text-decoration: underline;
  }

  .metamask_missing:hover {
    opacity: 0.9;
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

  .explain span.cyan {
    /*color: var(--dmt-bright-cyan);*/
    /*color: var(--dmt-cool-cyan);*/
    font-style: italic;
  }

  .explain span.green {
    /*color: var(--dmt-bright-cyan);*/
    /*color: var(--dmt-cool-cyan);*/
    color: var(--dmt-vibrant-green);
  }

  .metamask_missing img {
    width: 200px;
  }

  @media (max-width: 812px) {
    .metamask_missing {
      display: none;
    }
  }
</style>



