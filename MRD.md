# Matsya Sathi — Market Requirements Document
**Status:** Draft v1 • 22 October 2026 • College Ideas 5.0

## 1. Problem and audience
Matsya Sathi is a proposed Konkani-first companion for Goa's near-shore fishing communities. Its two connected needs are (a) understandable access to fisheries welfare scheme information and (b) reassurance and emergency communication for families while boats are at sea.

**Primary users:** near-shore fishermen using affordable Android phones, sometimes in bright sunlight and with inconsistent connectivity. **Secondary users:** family members ashore. **Other stakeholders:** local fishing communities, fisheries offices, and the hardware/backend team.

## 2. User jobs
- Fisherman: quickly see trip state, conditions, relevant schemes, and a prominent emergency action.
- Family: see last reported trip state, time of last update, and whether an alert is simulated or actually delivered.
- Both: use Konkani or English, accessible typography, straightforward navigation, and clear offline/connection status.

## 3. Differentiation hypothesis
A single experience combining a welfare-guidance workflow with a low-cost near-shore safety-beacon concept. This is a **project hypothesis**, not a proven claim that no comparable system exists.

## 4. Market assumptions to validate
- Connectivity varies with route and carrier; GSM cannot be guaranteed at sea.
- Hardware costs, LoRa range, marine suitability, and subsidy eligibility require real validation.
- PMMSY schemes, application requirements, and benefits change; obtain official current source material before claiming eligibility or grant amounts.
- Fishing-community testing is needed for Konkani language, comprehension, accessibility, and trust.

## 5. MVP success criteria (demo)
- Fisherman and family journeys both complete without dead ends.
- Demo trip updates appear across role views with explicit **SIMULATED** labels.
- Welfare questionnaire yields **indicative** matching, never guaranteed entitlement.
- SOS demo visibly shows hold, cancel countdown, alert state, and what channels would be used in a real integration.
- Layout works from 320px phones to wide desktops without horizontal overflow.

## 6. Not in frontend MVP
Actual GPS tracking, real SMS dispatch, live LoRa mesh, emergency-services dispatch, production authentication, government eligibility verification, and a live weather feed unless separately integrated and tested.

## 7. Open decisions
Confirm exact Konkani strings with native speakers; approve final logo and illustrations; verify scheme dataset and source dates; confirm backend API contracts and hardware message format; determine who can access family tracking.
