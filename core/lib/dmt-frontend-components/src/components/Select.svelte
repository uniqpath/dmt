<script>
  import ChevronDownIcon from './icons/ChevronDownIcon.svelte';

  export let value = '';
  /** @type {{ label: string, value: string }[] | string[]} */
  export let options = [];
  export let placeholder = '';

  $: computedOptions = options.map(v => (typeof v === 'string' ? { label: v, value: v } : v));
</script>

<div class="wrapper">
  <select bind:value {...$$restProps}>
    {#if placeholder}
      <option value="" disabled selected={value === ''}>{placeholder}</option>
    {/if}
    {#each computedOptions as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  <div class="icon">
    <ChevronDownIcon />
  </div>
</div>

<style>
  .wrapper {
    position: relative;
  }

  select {
    width: 100%;
    padding-right: 2rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  .icon {
    position: absolute;
    font-size: 0.8rem;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    pointer-events: none;
  }
</style>
