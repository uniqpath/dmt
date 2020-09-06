<script>
  import { getContext } from 'svelte';
  const app = getContext('app');
</script>

<img src="/apps/zeta/img/tropical_fish.png" alt="tropical-fish" />
Zeta Explorers (βeta) ·

<!-- <a href="#" on:click|preventDefault={() => { dispatch('explorersClick'); }}>Starting October 30</a> -->
<a href="#" on:click|preventDefault={() => { app.emit('explorersClick'); }}>Starting October 30</a>

<style>
a {
  color: var(--dmt-cyan);
  text-decoration: underline;
}

img {
  width: 30px;
  /*padding-right: 3px;*/
  vertical-align: middle;
  /*transform: scaleX(-1);*/
}
</style>
