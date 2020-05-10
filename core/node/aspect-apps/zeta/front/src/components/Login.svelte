<script>

  export let metamask;

  function login() {
    metamask.connect();
  }

</script>

<div class="login">
  <a href="/apps">
    <!-- <img src="/img/zeta_login.png" /> -->
    <img src="/apps/zeta/img/metamask.png" on:click|preventDefault={() => { login(); }} alt="metamask" />
  </a>
</div>

<style>
  .login img {
    position: absolute;
    top: 15px;
    top: 0;
    right: 0px;
    width: 120px;
    padding: 5px 20px;
  }

  .login:hover {
    opacity: 0.9;
  }

  @media (max-width: 812px) {
    .login {
      display: none;
    }
  }
</style>



