<script>
  export let transparent = false;
</script>

<ul class:transparent>
  <slot />
</ul>

<style>
  ul {
    list-style-type: none;
    padding: 0 1rem;
    margin: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  ul > :global(li) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }

  ul > :global(li:last-child) {
    border-bottom: none;
  }

  ul.transparent {
    background-color: transparent;
    border-radius: 0;
  }
</style>
