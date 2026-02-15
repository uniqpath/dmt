function applyMigration({ state, migration }) {
  const { toVersion, migrator } = migration;

  state.schemaVersion = toVersion;
  migrator(state);

  return state;
}

export default function migrateState({ state, schemaVersion, schemaMigrations = [] }) {
  let currentState = state;

  while (state.schemaVersion != schemaVersion) {
    const migration = schemaMigrations.find(({ fromVersion }) => fromVersion == state.schemaVersion);

    if (!migration) {
      return;
    }

    try {
      currentState = applyMigration({ state, migration });
    } catch (e) {
      return;
    }
  }

  return currentState;
}
