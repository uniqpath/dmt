const MAX_ENTRIES = 100;

function add(store, slotName, el) {
  const arr = store.get(slotName);

  arr.unshift(el);

  const elemsToDelete = arr.length - MAX_ENTRIES;
  arr.splice(arr.length - elemsToDelete, elemsToDelete);

  store.replaceSlot(slotName, arr);
}

export default function observer(program) {
  const slotName = 'recentSearchQueries';

  program.on('dmtapp::search::query', ({ query, page, selectedTags, totalHits, timezone, searchMetadata }) => {
    if (page == 1) {
      const el = { query, page, selectedTags, totalHits, timezone, datetime: Date.now() };

      add(program.store, slotName, el);
    }
  });

  program.on('dmtapp::link_click', ({ url, providerTag, timezone, clickMetadata }) => {
    const el = { url, timezone, datetime: Date.now() };
    add(program.store, slotName, el);
  });
}
