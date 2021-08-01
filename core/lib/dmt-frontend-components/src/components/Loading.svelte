<script>
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Logo from './Logo.svelte';

  export let dmtApp;

  // Fancy dot loading screen
  let dots = 1;

  const NUM = 5;

  let increasing = true;

  onMount(() => {
    const handler = setInterval(() => {
      const add = increasing ? 1 : -1;
      dots = dots + add;

      if (dots == NUM) {
        increasing = false;
      };
      if (dots == 1) {
        increasing = true;
      };
    }, 500);

    return () => clearInterval(handler);
  });
</script>

<div class="wrapper" in:fly out:fly>
  <Logo {dmtApp} />
  <p>Connecting <span>{'.'.repeat(dots)}</span></p>
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .wrapper p {
    color: var(--dmt-pink);
  }

  .wrapper p span {
    color: var(--dmt-cyan);
  }
</style>
