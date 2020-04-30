<script>
  export let store;

</script>

<div class="about">
  <b>Zeta</b> <span>PoC v0.1.0</span>

  <p>
    A new p2p digital era is slowly arriving.
  </p>

  <p>
    <b>Zeta</b> is first app built on top of <a href="https://dmt-system.com">DMT-SYSTEM</a>, Swarm and Ethereum.
  </p>

</div>

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
