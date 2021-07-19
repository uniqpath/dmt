export function setupGuiErrorHandler(errorStore) {
  function subscribe(store, ...callbacks) {
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }

  function get(store) {
    let value;
    subscribe(store, _ => (value = _))();
    return value;
  }

  return (msg, file, line, col, error) => {
    const { errors } = get(errorStore);

    const d = new Date();
    const time = `${d.getHours()}:${`0${d.getMinutes()}`.slice(-2)}`;

    if (error && error.stack) {
      errors.push({ msg, stacktrace: error.stack, time });
    } else {
      errors.push({
        msg: `"${msg}" (No more info because of CORS, fix: 1) check for the same error on device where gui runs on :80... 2) if more possible errors from this source, then rethrow - see example in dmt-connect/browser/connect around JSON.parse(msg))`,
        corsProblem: true,
        time
      });
    }

    errorStore.set({ errors });
  };
}
