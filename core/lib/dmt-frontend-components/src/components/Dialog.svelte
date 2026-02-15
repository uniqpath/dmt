<script>
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { backOut, quadIn } from 'svelte/easing';
  import CloseIcon from './icons/CloseIcon.svelte';
  import Button from './Button.svelte';

  const dispatch = createEventDispatcher();

  export let title;
  export let show;
  export let large = false;

  function closeDialog() {
    show = false;
    dispatch('close');
  }
</script>

{#if show}
  <div class="dialog-backdrop" transition:fade={{ duration: 150 }} on:click|self={closeDialog}>
    <div class="dialog" class:large in:scale={{ start: 0.9, easing: backOut, duration: 200 }} out:scale={{ start: 0.9, easing: quadIn, duration: 150 }}>
      <div class="dialog-header">
        <h1>{title}</h1>
        <Button icon on:click={closeDialog}>
          <CloseIcon />
        </Button>
      </div>
      <div class="dialog-content">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    width: 400px;
    max-width: calc(100% - 2rem);
    max-height: 80vh;
    padding: 1rem;
    background-color: var(--dmt-magenta);
    border-radius: 0.5rem;
  }

  .dialog.large {
    width: var(--container-max-width);
    height: 100%;
  }

  .dialog-header {
    flex: 0 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .dialog-content {
    flex: 1 1;
    overflow: hidden;
  }

  h1 {
    margin: 0;
  }
</style>
