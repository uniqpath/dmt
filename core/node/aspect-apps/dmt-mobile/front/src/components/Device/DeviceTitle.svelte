<!--
  ***************************************
  ********* STATE AND FUNCTIONS *********
  ***************************************
-->

<script>

  export let connected;
  export let deviceName;

</script>

<!--
  *************************
  ********** GUI **********
  *************************
-->

<!-- <p>{connected ? 'CONNECTED' : 'Disconnected ✖'}</p> -->

{#if deviceName}
  <!-- class:faded={!connected} --> <!-- add this attribute if you want faded while trying to reconnected -->
  <h2 class:faded={connected == false}>{deviceName} {connected != false ? '' : '✖'}</h2>
{/if}

<!--
  *************************
  ********* STYLE *********
  *************************
-->

<style>

h2.faded {
  color: #999;
}

</style>

