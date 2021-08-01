export default function removeUnsaved(state, unsavedSlots, beforeLoadAndSave) {
  for (const slotName of unsavedSlots) {
    delete state[slotName];
  }

  beforeLoadAndSave(state);

  return state;
}
