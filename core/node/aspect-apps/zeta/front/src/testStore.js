import { writable, derived } from 'svelte/store';

export const searchMode = writable(0);
export const searchResponse = writable({});
