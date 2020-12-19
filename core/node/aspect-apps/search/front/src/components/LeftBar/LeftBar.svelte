<script>
  import { getContext } from 'svelte';
  const app = getContext('app');

  export let loggedIn;
  export let isAdmin;

  export let backend;

  import PeerList from './PeerList.svelte';

</script>

<div class="leftbar">

  <PeerList {backend} />

</div>

<style>
  .leftbar {
    position: absolute;
    top: 0px;
    left: 0px;

    color: white;
  }

  /*.more_inside {
    margin-left: 30px;
  }*/

  :global(.leftbar a) {
    color: #333;
    text-decoration: underline;
    text-decoration-style: dotted;
  }

  :global(.leftbar a:hover) {
    color: #111;
    text-decoration-style: solid;
  }

  :global(.leftbar span.date) {
    color: var(--dmt-violet-dark);
    font-size: 0.9em;
  }

  @media (max-width: 1150px) {
    .leftbar {
      display: none;
    }
  }
</style>



