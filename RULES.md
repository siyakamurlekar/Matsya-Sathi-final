# Matsya Sathi — Engineering and AI Coding Rules

## Instruction priority
1. User-approved screen/design decisions.
2. `PRD.md` for behavior and scope.
3. `DESIGN.md` for visual language.
4. `ARCHITECTURE.md` for implementation boundaries.
5. `TASKS.md` for execution order.
When requirements conflict, **ask** instead of silently choosing.

## Stack
Vite + React + TypeScript, React Router, CSS Modules and CSS variables, Zustand for demo state, JSON locale dictionaries, localStorage, BroadcastChannel where useful. Prefer minimal dependencies. No Next.js, Redux, chatbot, or map SDK without approval.

## Working protocol
- Work in small verified steps; explain files changed, why, expected output, and how to test.
- Never delete/overwrite existing user work without inspection and a backup or explicit approval.
- One focused screen/feature per change; run build checks regularly.
- Do not claim code was tested unless it was actually executed.
- Keep a changelog/checklist in `TASKS.md`.

## UI constraints
- Match approved concept and refine deliberately; no generic templates or gratuitous gradients.
- Responsive from 320px through desktop; no horizontal page overflow or clipped content.
- Reflow layouts by breakpoint; never use fixed phone-frame sizing in actual UI.
- Maintain accessible contrast, semantic HTML, keyboard operation, visible focus, reduced-motion support, and large touch targets.
- Never hardcode translations directly throughout JSX; use locale dictionaries.

## Code organization
- Small typed components, meaningful names, explicit props, no giant all-in-one `App.tsx`.
- Use centralized tokens, reusable shared UI components, and CSS Modules.
- Separate mock/demo adapters from real API adapters; avoid direct DOM manipulation.
- Do not add a dependency unless it solves a concrete need and is documented.

## Safety and data integrity
- All fake GPS, weather, SMS, LoRa, network status, and SOS outputs must be labeled **SIMULATED**.
- Never display 'Alert sent to Coast Guard' or 'family notified' as fact without confirmed real delivery.
- Schemes are **indicative**, not certified or guaranteed; never fabricate eligibility or official endorsements.
- Use sample personal data only; do not commit real phone numbers, secrets, credentials, or `.env` values.

## Git discipline
- Keep a working build, commit in logical increments, and push only after review.
- `npm run build` must succeed before handoff; check console and responsive widths.
