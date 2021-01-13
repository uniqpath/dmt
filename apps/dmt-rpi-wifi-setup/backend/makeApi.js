export default function makeApi(store) {
  return {
    setup({ apssid, password }) {
      store.update({ credentials: { apssid, password } });
    }
  };
}
