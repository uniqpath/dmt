export default function removeVolatileElements(slots, state) {
  for (const slotName of Object.keys(state)) {
    if (slots[slotName]?.isVolatile()) {
      const { volatileCallback } = slots[slotName];

      if (volatileCallback) {
        volatileCallback(state[slotName]);
      } else {
        delete state[slotName];
      }
    }
  }

  return state;
}
