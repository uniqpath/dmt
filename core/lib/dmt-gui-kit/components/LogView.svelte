<script>
  import logStore from '../store/logStore';

  // export let store;
  export let showLogInitially = true;
  export let title;
  export let limit = 0;

  if(limit > logStore.LIMIT) {
    console.log(`Warning: provided LogView line limit (${limit}) is larger than logStore limit  (${logStore.LIMIT})`)
    console.log(`Utilizing the lower value ...`)
    limit = logStore.LIMIT;
  }

  let showLog = showLogInitially;
  //let showLog = false;

  $: logEntries = $logStore.slice(-limit).reverse();

  let lastCheckAt;

  // accurate to ~500ms
  function detectContextSwitch() {
    const now = Date.now();

    if(lastCheckAt && now - lastCheckAt > 500) {
      logStore.log('——— Context switch / App wake ———', { dedup: true });
    }

    lastCheckAt = now;

    setTimeout(detectContextSwitch, 300);
  }

  detectContextSwitch();
</script>

<div class="logview">

  {#if title}
    <h2 class="title">{title}</h2>
  {/if}

  {#if showLog}
    <slot />

    <!-- <p class="pubkey">Pubkey: <span>{store.keypair.publicKeyHex}</span></p> -->

    <!-- ⚠️ warning: does toLocaleString always produce something that is separated with comma ? todo: do this differently -->
    {#each logEntries.map((obj) => {
      const time = obj.createdDate.toLocaleString().split(',')[1];
      return { ...obj, time }
    }) as { time, entry, isRecent, isVeryRecent, createdAt }, i}

      <div class="log_entry" class:recent={isRecent} class:very_recent={isVeryRecent}>

        <span class="time">
          {#if i < logEntries.length - 1}
            {#if createdAt - logEntries[i+1].createdAt < 10000}
              <span class="diff">
                +{createdAt - logEntries[i+1].createdAt}ms
              </span>
            {:else}
              {time}
            {/if}
          {:else}
            {time}
          {/if}
        </span>

        {entry}

      </div>

    {/each}

  {:else}
    <button on:click={() => { showLog = true; }}>Show Log</button>
  {/if}

</div>

<style>

.logview {
  color: var(--dmt-light-gray);
  width: 95%;
  max-width: 600px;
  text-align: left;
  margin: 0 auto;
  padding-bottom: 20px;
}

h2.title {
  color: var(--dmt-light-cyan);
  text-align: center;
}

/*.pubkey {
  font-size: 0.7rem;
}

.pubkey span {
  color: var(--dmt-silver);
}
*/
.log_entry {
  font-size: 0.8rem;
  margin-bottom: 1px;
  color: var(--dmt-silver);
}

.log_entry.recent {
  color: var(--dmt-cyan);
}

.log_entry.very_recent {
  color: var(--dmt-green);
}

.log_entry span.time {
  color: gray;
  color: var(--dmt-light-cyan);
  padding-right: 5px;
  width: 50px;
  text-align: right;
  display: inline-block;
  font-size: 0.9em;
}

.log_entry span.time span.diff {
  color: var(--dmt-gray);
}

button {
  background-color: var(--dmt-light-cyan);
  border: 0;
  padding: 10px;
  width: 100px;
  margin: 0 auto;
  display: block;
}

/* is this correct css media tag for iphone ? */
@media only screen and (max-width: 768px) {
  .pubkey {
    font-size: 0.2rem;
  }
  .log_entry {
    font-size: 0.4rem;
  }
}

</style>
