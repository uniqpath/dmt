<script>
  export let fluid = false;
</script>

<li>
  <div class:fluid>
    <slot />
  </div>
</li>

<style>
  div {
    /* reclaim horizontal space padded by <List /> */
    margin: 0 -1rem;
    padding: 0.625rem 1rem;
  }

  .fluid {
    padding: 0;
  }
</style>
