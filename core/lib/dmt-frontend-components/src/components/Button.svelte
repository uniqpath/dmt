<script>
  export let icon = false;
  /** @type {"sm" | "md" | lg"} */
  export let size = 'md';
  /** @type {"normal" | "primary"} */
  export let variant = 'normal';
  export let href = '';
</script>

{#if href}
  <a class="btn {size} {variant}" class:icon {href} {...$$restProps} on:click><slot /></a>
{:else}
  <button class="btn {size} {variant}" class:icon {...$$restProps} on:click><slot /></button>
{/if}

<style>
  .btn {
    --btn-color: 255, 255, 255;
    display: inline-block;
    padding: 0.6rem 0.8rem;
    margin: 0;
    border-radius: 0.5rem;
    font-weight: 600;
    color: rgb(var(--btn-color));
    background-color: rgba(var(--btn-color), 0.15);
    outline: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  .btn.primary {
    --btn-color: var(--dmt-cool-cyan-rgb);
  }

  .btn.sm {
    padding: 0.4rem 0.6rem;
  }

  .btn.lg {
    padding: 0.8rem 1rem;
  }

  .btn.icon {
    padding: 0.6rem;
    border-radius: 50%;
  }

  .btn.icon.sm {
    padding: 0.4rem;
  }

  .btn.icon.lg {
    padding: 0.8rem;
  }

  .btn:hover {
    background-color: rgba(var(--btn-color), 0.2);
  }

  .btn:focus {
    background-color: rgba(var(--btn-color), 0.25);
  }
</style>
