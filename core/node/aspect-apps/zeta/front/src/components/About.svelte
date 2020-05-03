<script>
  export let store;

// ugly hack for now:
const isZetaSeek = window.location.hostname == 'zetaseek.com';

</script>

{#if isZetaSeek}

  <div class="about">
    <b>Zeta</b> <span>PoC v0.1.1</span>

    <p>
      A new p2p digital era is slowly arriving.
    </p>

    <p>
      <b>Zeta</b> is a fast evolving search technology on <b>modern web3 stack</b>.
    </p>

    <p>
      <b>zetaseek.com</b> is one useful instance of Zeta knowledge node.
    </p>

    <!-- <p>
      <a href="https://github.com/uniqpath/dmt/tree/master/core/node/aspect-apps/zeta/front">[zeta frontend code]</a> | <a href="https://github.com/uniqpath/dmt/tree/master/core/node">[dmt backend code]</a>
    </p> -->
  </div>

{/if}

<style>
.about {
  width: 350px;
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 10px;
  color: white;
  font-size: 0.8em;
  opacity: 0.8;
  border-top-left-radius: 10px;
  color: #232527;
  background-color: #A4938B;
  background-color: #D9EBD5;
}

.about p, .about span {
  font-size: 0.8em;
  color: #232527;
}

a {
  color: white;
  color: #232527;
  text-decoration: underline;
}

a:hover {
  color: #404076;
}

@media only screen and (max-width: 768px) {
  .about {
    display: none;
  }
}

</style>
