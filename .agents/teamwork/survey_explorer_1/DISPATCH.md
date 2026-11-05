# Task Assignment: Codebase Architecture Survey (Explorer 1)

## Context
You are a read-only exploration agent investigating the ASAR monorepo for R1, R2, R3, R4.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md

## Objective
Survey all applications under `apps/*` and packages under `packages/*`:
1. Check existing apps in `apps/` (Admin, Booth, Invitation, Main, etc.) and packages in `packages/`.
2. Inspect package.json files, dependencies (specifically react-router, react-router-dom versions, TypeScript configs, Vite/build configs).
3. Check current routing implementation in each app: how navigation and page rendering currently work across all apps.
4. Investigate the requirements for creating a NEW dedicated renderer app under `apps/` (e.g. `apps/Renderer` or `apps/Storefront` or similar naming):
   - What structure should it have (Vite + React + TS, matching monorepo conventions)?
   - How will it resolve subdomains dynamically and conditionally render Invitation memories vs Booth memories?
5. Identify any compilation, bundling, or workspace setup details (pnpm/npm/yarn, workspace configs).

## Deliverable
Write a detailed investigation report to `d:\asar\.agents\teamwork\survey_explorer_1\handoff.md`.
Include concrete file paths, code snippets, package versions, and architecture recommendations.
Do NOT modify any code.

## 2026-11-03T22:05:37Z
You are survey_explorer_1 (Role: Codebase Architecture Explorer).
Your working directory is d:\asar\.agents\teamwork\survey_explorer_1\
MANDATORY: Read ORIGINAL_REQUEST.md at d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md and task instructions in d:\asar\.agents\teamwork\survey_explorer_1\DISPATCH.md before starting work.
Survey all applications in apps/* and packages in packages/* to map existing routing, dependencies, build setup, and architecture requirements for introducing a new dedicated renderer app under apps/.
Write your findings and evidence chain to d:\asar\.agents\teamwork\survey_explorer_1\handoff.md.
Send a message back when complete with the path to your handoff report.

## 2026-11-04T00:19:09Z
Sender: 1702b5c8-8740-4f25-b6f5-898d68518b3a
Task:
1. Explore `apps/Admin` and shared packages (`packages/react-appwrite`, `packages/types`, etc.) in `d:\asar`.
2. Analyze how Admin currently manages events, invitations, booth memories, templates, and forms:
   - Inspect `apps/Admin/src/components/invitation/InvitationStudio.tsx`, `BoothMemoryStudio.tsx`, `PlanBuilderStudio.tsx`, `OrdersQueueManager.tsx`, etc.
   - Inspect `packages/react-appwrite` to see current schema models, stores, services, and utilities.
3. Determine how to implement R2 ("Admin Modular Website Creation Editor"):
   - How administrators can create and manage event websites by dropping in, reordering, configuring, and removing modular sections (RSVP, Wishing Wall, Event Schedule, Background Audio, Digital Gift Registry / Bank QR, Photo Gallery, Cover/Hero, Story, etc.).
   - UI/UX layout for the editor: Section Palette / Picker (Add Section), Section Reorder List (drag/drop or up/down order controls), Section Config Inspector (dedicated config form per section type with preview values), and Live Preview canvas / split-screen.
   - Propose the exact TypeScript data schema for modular sections (e.g. `ModularWebsiteConfig`, `SectionType`, `SectionConfigMap`, `SectionBase`, discriminated union `EventSection`).
   - Data persistence: how this section configuration will be stored, fetched, and saved (using Appwrite collections / models / mocks in `@repo/react-appwrite` and local state).
4. Produce a detailed architectural analysis and design document at:
   d:\asar\.agents\teamwork\survey_explorer_1\admin_modular_editor_analysis.md
5. Write your handoff report at:
   d:\asar\.agents\teamwork\survey_explorer_1\handoff.md
6. Send a completion message back to the orchestrator (conversation ID: 1702b5c8-8740-4f25-b6f5-898d68518b3a).

