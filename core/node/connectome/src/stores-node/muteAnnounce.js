export default function muteAnnounce(slots, state) {
  for (const slotName of Object.keys(state)) {
    if (slots[slotName]?.mutesAnnounce()) {
      const { muteAnnounceCallback } = slots[slotName];

      if (muteAnnounceCallback) {
        muteAnnounceCallback(state[slotName]);
      } else {
        delete state[slotName];
      }
    }
  }

  return state;
}
