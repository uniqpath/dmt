import { writable } from 'svelte/store';
function createSnackStore() {
  const { subscribe, update, set } = writable(null);
  let timeoutId;
  const close = () => {
    clearTimeout(timeoutId);
    set(null);
  };
  return {
    subscribe,
    show: (value, { color = 'normal', timeout = 8000 } = {}) =>
      update(() => {
        close();
        timeoutId = setTimeout(close, timeout);
        return { message: value, color };
      }),
    close
  };
}
export const snackbar = createSnackStore();
