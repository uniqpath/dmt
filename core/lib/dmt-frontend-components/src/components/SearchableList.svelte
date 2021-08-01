<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import List from './List.svelte';
  import ListItem from './ListItem.svelte';

  const dispatch = createEventDispatcher();

  export let items = [];
  export let transparent = false;
  export let noItemsText = '';
  export let searchPlaceholder = '';
  export let searchAutofocus = false;
  export let searchHandler = (items, search) => {
    search = search.toLowerCase();
    return items.filter(v => v.toLowerCase().includes(search));
  };

  let search = '';
  let highlightIndex = -1;

  $: filteredItems = search ? searchHandler(items, search) : items;

  $: if (search) {
    highlightIndex = filteredItems.length > 0 ? 0 : -1;
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      highlightIndex--;
      if (highlightIndex < 0) {
        highlightIndex = filteredItems.length - 1;
      }
    } else if (e.key === 'ArrowDown') {
      highlightIndex++;
      if (highlightIndex >= filteredItems.length) {
        highlightIndex = 0;
      }
    } else if (e.key === 'Enter') {
      dispatch('selectItem', filteredItems[highlightIndex]);
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }
</script>

<div class="wrapper" class:transparent>
  <div class="search-input">
    <div>
      <!-- svelte-ignore a11y-autofocus -->
      <input type="search" bind:value={search} on:keydown={handleSearchKeyDown} autofocus={searchAutofocus} placeholder={searchPlaceholder} />
    </div>
  </div>
  <div class="list">
    <List transparent>
      {#each filteredItems as item, i}
        <ListItem fluid>
          <button class:highlight={highlightIndex === i} on:click={() => dispatch('selectItem', item)}>
            <slot name="item" {item}>{item}</slot>
          </button>
        </ListItem>
      {:else}
        {#if $$slots.noItems || noItemsText}
          <ListItem>
            <slot name="noItems">
              <p>{noItemsText}</p>
            </slot>
          </ListItem>
        {/if}
      {/each}
    </List>
  </div>
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .wrapper.transparent {
    background-color: transparent;
    border-radius: 0;
  }

  .search-input {
    margin: 0 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
  }

  .search-input > div {
    margin: 0 -1rem;
  }

  .list {
    flex: 1;
    height: 100%;
    overflow-y: auto;
  }

  input {
    width: 100%;
    padding: 0.8rem 1rem;
    border-radius: 0;
    background-color: transparent;
    color: white;
    font-weight: 600;
  }

  button {
    width: 100%;
    padding: 0.625rem 1rem;
    border-radius: 0;
    outline: none;
    border: 0;
    color: white;
    background-color: transparent;
    text-align: left;
    transition: color 0.2s, background-color 0.2s;
  }

  button:hover {
    color: rgb(var(--dmt-cool-cyan-rgb));
    background-color: rgba(var(--dmt-cool-cyan-rgb), 0.15);
  }

  button:focus,
  button.highlight {
    color: rgb(var(--dmt-cool-cyan-rgb));
    background-color: rgba(var(--dmt-cool-cyan-rgb), 0.2);
  }

  p {
    text-align: center;
    opacity: 0.5;
    margin: 0;
  }
</style>
