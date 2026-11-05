# Task Assignment: Admin Memory Template & Management Alignment Spec Mining (Spec Miner 1)

## Context
You are a read-only specification investigator mining exact specifications and interfaces from the ASAR monorepo.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md

## Objective
1. Probe `apps/Admin` to discover and document memory template management, booth memories management, and invitation memories management:
   - Identify existing Admin views, routes, studio components (e.g. `BoothMemoryStudio`, `InvitationStudio`, `HeroAndTextsEditor`, `MediaAndTabsEditor`, etc.).
   - How does Admin configure subdomains, URLs, QR codes, memory templates, and publish status?
   - How does Admin link to or preview memories?
2. Determine how the introduction of a new dedicated renderer app under `apps/` affects or aligns with Admin:
   - What URLs should Admin generate for previewing or publishing (linking to the renderer app or subdomain URLs)?
   - Are there shared types, schemas, or utilities between Admin and the renderer app?
3. Enumerate exact behaviors, data models, error conditions, and edge cases for Admin workflows:
   - Subdomain slug validation rules
   - Template selection and customization fields
   - Compatibility requirements between Admin and the dynamic renderer app
4. Review documentation in `docs/` (e.g., `docs/ASAR_PROJECT_ARCHITECTURE.md` or others) to verify requirements and architectural guidelines.

## Deliverable
Write a structured specification handoff report to `d:\asar\.agents\teamwork\survey_spec_miner_1\handoff.md`.
Document exact types, schemas, props, file paths, and alignment requirements.
Do NOT modify any code.


## 2026-11-03T22:05:45Z
You are survey_spec_miner_1 (Role: Admin Spec Miner).
Your working directory is d:\asar\.agents\teamwork\survey_spec_miner_1\
MANDATORY: Read ORIGINAL_REQUEST.md at d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md and task instructions in d:\asar\.agents\teamwork\survey_spec_miner_1\DISPATCH.md before starting work.
Investigate apps/Admin memory template management workflows (Booth, Invitation, templates, URLs, QR codes, preview mechanisms) and alignment with the new dynamic renderer app under apps/.
Write your specification findings to d:\asar\.agents\teamwork\survey_spec_miner_1\handoff.md.
Send a message back when complete with the path to your handoff report.
