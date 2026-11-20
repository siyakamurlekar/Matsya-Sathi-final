# Matsya Sathi — Frontend Architecture
**Proposed, subject to existing project inspection.**

```text
src/
  app/             # routing, app providers, app shell
  assets/          # local optimized artwork/icons
  components/      # reusable buttons, cards, navigation, status, SOS
  features/
    onboarding/
    fisherman/
    family/
    trips/
    schemes/
    emergency/
    notifications/
    settings/
  data/            # demo schemes, demo weather, fixtures
  i18n/            # en.json, kok.json, translation helpers
  services/        # demo adapters; future API interfaces
  store/           # Zustand app/trip store
  styles/          # tokens and global foundations
  types/           # shared TypeScript models
```

## State and persistence
Zustand is the single source for role, preferences, and demo trip status. Persist appropriate settings to localStorage; broadcast simulated trip changes across tabs. Avoid storing sensitive data unnecessarily.

## Separation of concerns
UI reads typed service interfaces. Demo services supply fixtures and explicitly simulated events. Backend teammates can replace services with real APIs without rewriting screens. Handle loading, empty, failure, and stale-data states.

## Integration checkpoints
Confirm backend endpoints, event timestamps, alert delivery acknowledgements, authentication/privacy boundaries, scheme source provenance, and beacon status protocol before connecting real data.
