# Original User Request

## Initial Request — 2026-11-05T16:36:47Z

Analyze the documentation files describing Asar, connect and verify all data with Appwrite, implement all missing cloud functions, redesign the Admin dashboard with Cairo font and a smooth auth journey, replace dummy components, and ensure smooth user journeys across all apps to make the project ship-ready.

Working directory: d:\asar
Integrity mode: demo
The team must NOT: Use pre-built libraries or frameworks for core functionality

## Requirements

### R1. Documentation Analysis and Monorepo Production Readiness
Analyze all documentation files in `docs/` (including `AGENT_01` through `AGENT_10`, `ASAR_PROJECT_ARCHITECTURE.md`, `ASAR_DESIGN_SYSTEM.md`, and `ASAR_BOOTH_DESIGN_SPEC.md`) and the reference architecture in `d:\lyder-eco`. Resolve incomplete implementations, dummy components, and missing connections across all apps (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`) and packages to make the Asar project ship-ready. Avoid running `npm run build` repeatedly without reason and avoid creating unneeded scripts or code generators.

### R2. Appwrite Data Connection and Cloud Functions
Verify that all data models, collections, and relations in the Asar apps match the Appwrite project schema (`asar-db` on endpoint `https://fra.cloud.appwrite.io/v1`). Implement all missing cloud functions in `appwrite/functions/` (referencing `appwrite/appwrite.config.json` and standard patterns in `d:\lyder-eco`) with full business logic, environment variable definitions, error handling, and deployment readiness.

### R3. Admin Dashboard Redesign and Authentication Journey
Redesign `apps/Admin` to resolve usability and UX flaws, utilizing the 'Cairo' font for typography and an intuitive luxury design. Verify and fix the authentication journey in the Admin dashboard so that auth flows, role-based access, and session management work flawlessly.

### R4. Cross-App User Journey Optimization
Audit and polish user journeys across all apps (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`), eliminating dummy placeholders and ensuring smooth end-to-end data flow and state management connected to Appwrite.

## Verification Resources
- Monorepo test suites in `packages/react-appwrite/test` and `apps/*/test`
- Reference architecture project: `d:\lyder-eco`
- Appwrite configuration: `appwrite/appwrite.config.json` and live project `6ad1c66c0017b63ab8cc` (`asar-db`)
- Documentation specifications in `docs/`

## Acceptance Criteria

### Monorepo & Build Health
- [ ] All apps (`Admin`, `Booth`, `Invitation`, `Main`, `Renderer`) and shared packages pass type checks and linting without errors.
- [ ] No extraneous build commands or unnecessary code generator scripts are introduced.
- [ ] Dummy placeholder components across all apps are replaced with functional implementations wired to Appwrite.

### Appwrite Backend & Cloud Functions
- [ ] Appwrite client and server integrations across all apps connect properly to database `asar-db`.
- [ ] Every required cloud function specified in `appwrite/appwrite.config.json` exists in `appwrite/functions/` with functional handler code.
- [ ] Cloud functions and data services execute successfully when verified against the configured Appwrite project and automated tests.

### Admin Dashboard & Auth Journey
- [ ] The Admin dashboard typography is configured to use the 'Cairo' font.
- [ ] The Admin dashboard UI provides an intuitive luxury user experience without confusing navigation or broken layouts.
- [ ] The Admin dashboard auth journey handles login, session persistence, role checks, and logout reliably without unhandled errors.

### Cross-App User Journeys
- [ ] User journeys across `apps/Booth`, `apps/Invitation`, `apps/Main`, and `apps/Renderer` complete their end-to-end workflows with live Appwrite data persistence.
