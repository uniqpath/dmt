import { writable, derived } from 'svelte/store';

export const searchMode = writable(localStorage.getItem('searchMode') ? parseInt(localStorage.getItem('searchMode')) : 0);
