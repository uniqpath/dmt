<script>
  import { getContext } from 'svelte';
  const app = getContext('app');
</script>

{#if app.isZetaSeek}

  <div class="about">
    <b>Zeta</b> <span>PoC v0.1.3</span>

    <p>
      <b>Zeta</b> is an evolving search technology on <b>modern web3 stack</b>.
    </p>

    <p>
      [ Imagine all the people sharing all the files. ]
    </p>

    <p>
      [ And the network will live as one. ]
    </p>

    <!-- <p>
      Principal use is as an installed engine (desktop or server).
    </p>

    <p>
      Instructions coming soon.
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
