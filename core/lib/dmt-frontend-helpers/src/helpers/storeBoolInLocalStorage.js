export function storeBoolInLocalStorage(svelteStore, key) {
  if (localStorage.getItem(key) == 'true') {
    svelteStore.set(true);
  }

  if (localStorage.getItem(key) == 'false') {
    svelteStore.set(false);
  }

  svelteStore.subscribe(val => {
    localStorage.setItem(key, val.toString());
  });
}
