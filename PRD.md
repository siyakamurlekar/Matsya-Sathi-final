# Matsya Sathi — Product Requirements Document
**Status:** Implementation baseline v1 • Frontend-first demonstration

## Product promise
A coastal companion for Goa's near-shore fishermen and families: understandable welfare guidance and clearly communicated trip-safety information. The frontend is a demonstrator, **not a deployed marine safety system**.

## Personas and roles
- **Fisherman:** sets up profile/boat, views dashboard, starts simulated trip, sees updates, opens emergency demo, checks conditions and schemes.
- **Family member:** chooses linked fisherman (demo profile), sees last trip status, timestamps, updates, and simulated alerts.

## Screen inventory and route intent
| ID | Screen | Minimum functionality |
|---|---|---|
| 01 | Splash | Brand, concise message, continue |
| 02 | Language | Konkani / English; persist choice |
| 03 | Role | Fisherman / family; persist choice |
| 04 | Accessibility | Voice guidance preference, larger text, high contrast, simple mode |
| 05 | Profile | Name, village, phone optional, boat details for fisherman; basic validation |
| 06 | How it works | Explain simulated trip, updates, beacon concept, schemes |
| 07A | Fisherman home | Trip state, status, primary Start/End Trip action, shortcuts |
| 07B | Family home | Linked fisherman, last-known state and timestamp, latest updates |
| 08 | Live trip | Demo location illustration/map, timestamps, status, manual simulation controls |
| 09 | Conditions | Demo weather/sea data with clear source/status labeling |
| 10 | Welfare schemes | Browse, search/filter, four-question indicative matcher |
| 11 | Scheme details | Description, indicative requirements, documents, official verification CTA |
| 12 | SOS | Press-and-hold interaction; cancelable countdown; visible demo warning |
| 13 | SOS result | Explicit simulated outcome; no claim of real delivery |
| 14 | Notifications | Trip updates, simulated alerts, safe return |
| 15 | Profile/settings | Edit details, language, accessibility, reset demo |

## User flows
1. **First visit:** Splash → language → role → accessibility → profile → how-it-works → role dashboard.
2. **Fisherman:** dashboard → start demo trip → simulated departure → simulated check-in → safe return → dashboard.
3. **Family:** dashboard → view linked fisherman's latest demo status → notifications.
4. **SOS demo:** open SOS → hold 3 seconds → 10-second cancel window → simulated alert result. Release early cancels the hold. Demo never contacts emergency services.
5. **Schemes:** four-question matcher → indicative list → detail → official verification instructions.

## Functional requirements
- Navigation must work by keyboard, touch, and browser back/forward.
- Role, language, and accessibility settings persist locally; a reset action is available.
- Shared simulated trip data is kept in one store; cross-tab demo sync can use BroadcastChannel with localStorage fallback.
- Simulated events include timestamps and states: `at_jetty`, `departed`, `at_sea`, `sos_pending`, `sos_simulated`, `returned`.
- Data and presentation are separate so backend APIs can replace demo adapters later.
- Every status shows its provenance: **Demo data**, **Last updated**, or **Unavailable**. Never present simulated network or GPS as live.
- Translation dictionaries support English and Konkani. Use approved translations, not invented placeholders, in final release.
- No chatbot, unnecessary map SDK, or production auth in MVP.

## Non-functional acceptance
- 320px, 375px, 390px, 768px, 1024px, 1440px, 1920px widths tested; no horizontal page overflow.
- Mobile-first layouts; tablet/desktop reflow rather than stretched phone mockups.
- Touch targets approximately 44×44 CSS pixels or larger; visible focus indicators; semantic labels; color not sole status cue.
- Test 200% zoom, long translations, portrait/landscape, and reduced-motion preference.
- Build passes (`npm run build`), no console errors in normal demo flows.

## Data contracts (draft, confirm with backend teammate)
`UserProfile {id, role, name, village, boatName?, phone?}`
`Trip {id, fisherId, status, startedAt?, lastUpdatedAt, lastKnownPosition?, source:'demo'|'device'|'server'}`
`TripEvent {id, tripId, type, createdAt, message, deliveryStatus:'simulated'|'pending'|'confirmed'|'failed'}`
`Scheme {id, name, summary, criteria, documents, sourceUrl?, lastVerifiedAt?}`

## Boundaries and safety
Do not promise automatic rescue, verified eligibility, real SMS, precise GPS, or Coast Guard notification. Any external system integration requires separate testing, privacy review, and explicit UI states.

## Definition of done
Every approved screen is responsive, visually consistent, navigable, interactive where specified, and honest about demo limitations; README and GitHub repository are ready for handoff.
