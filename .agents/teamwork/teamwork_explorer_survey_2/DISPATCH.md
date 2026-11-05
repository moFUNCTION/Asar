## 2026-11-03T13:47:20Z
You are teamwork_explorer instance 2.
Your identity: Subdomain Memory Renderer Explorer
Your working directory: d:\asar\.agents\teamwork\teamwork_explorer_survey_2

## Mandatory First Step
Read the original user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md

## Scope & Objective
You are a READ-ONLY technical explorer. Do NOT edit or create any source code files.
Investigate the requirements and architecture for dynamic subdomain-based rendering for Invitation and Booth memories (operating like a web builder storefront platform):
1. Examine existing Booth memory presentation components (`apps/Booth/src/components/memory/*`) and Invitation custom renderer components (`apps/Invitation/src/components/*` or custom renderer). How are memories structured, styled, and hydrated?
2. Examine data models and querying in `packages/react-appwrite` and existing apps:
   - What collections, documents, or data structures represent Booth memories and Invitation memories?
   - How are memories identified? (id, slug, subdomain, custom domain?) Is there already a `subdomain` or `slug` field in BoothMemory / Invitation models?
3. Investigate Subdomain Resolution & Dynamic Storefront Architecture:
   - How does a storefront platform (like Shopify or a web builder) resolve subdomains?
   - In production (e.g., `wedding-alex.asar.me` or `vip-gala.asar.me`), how should the app extract the subdomain from `window.location.hostname`?
   - In local development (`subdomain.localhost:3000` or `localhost:3000?subdomain=...` or path-based / query-param fallback), how can developers easily test dynamic subdomain rendering without editing hosts files?
   - Should there be a dedicated renderer app under `apps/` (e.g. `apps/Storefront` or `apps/Renderer` or `apps/Memory`) OR should `apps/Booth` and `apps/Invitation` handle subdomain routing, OR should a new dedicated dynamic renderer app handle all public memory storefronts? Evaluate the trade-offs (separation of concerns, build isolation, bundle size, routing simplicity) and provide a concrete recommendation.
4. Detail the dynamic rendering pipeline:
   - Subdomain resolution hook (`useSubdomain`, `resolveSubdomainMemory`)
   - Fetching memory record & template config by subdomain/slug
   - Selecting the correct memory type (Booth Memory vs Invitation Memory) and dynamic template (e.g. Luxury, Modern, Minimal, Interactive)
   - Fallback/404 handling when a subdomain is not found or inactive.
   - Password protection / private memory access if applicable.

## Output Requirements
Write your detailed analysis and findings to:
`d:\asar\.agents\teamwork\teamwork_explorer_survey_2\analysis.md`
and write your self-contained handoff report to:
`d:\asar\.agents\teamwork\teamwork_explorer_survey_2\handoff.md`
When finished, send a brief completion message to your caller (orchestrator) with the summary and path to your handoff.md.
