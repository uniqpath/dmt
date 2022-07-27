import { writable } from 'svelte/store';
const logStore = writable([]);
export default logStore;
logStore.LIMIT = 300;
logStore.log = (args, { dedup = false } = {}) => {
  logStore.update(state => {
    if (dedup && state.length > 0 && state[state.length - 1].entry == args) {
      state.pop();
    }
    state.push({ entry: args, createdDate: new Date(), createdAt: Date.now(), isRecent: true, isVeryRecent: true });
    return state.slice(-logStore.LIMIT);
  });
};
function updateTicker() {
  const now = Date.now();
  logStore.update(state => {
    for (const line of state) {
      line.isRecent = now - line.createdAt < 60000;
      line.isVeryRecent = now - line.createdAt < 5000;
    }
    return state;
  });
  setTimeout(updateTicker, 1000);
}
updateTicker();
