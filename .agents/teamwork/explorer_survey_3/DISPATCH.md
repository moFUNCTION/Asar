## 2026-11-05T08:39:56Z
You are Explorer Survey 3. Your working directory is d:\asar\.agents\teamwork\explorer_survey_3\.

MANDATORY FIRST STEP: Read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting any work.

Objective:
Investigate and map the full end-to-end user journeys and the Admin Dashboard structure:
1. Customer Journeys:
   - Booth Memories flow: Landing (apps/Booth) -> Booking/package selection -> Order creation/checkout -> Client portal (managing booking, audio memories, media assets).
   - Invitation Websites flow: Landing (apps/Invitation) -> Template/package selection -> Customization/ordering -> Client portal (managing guest list, RSVPs, wishing wall, dynamic site settings).
   - Client Portal in apps/Main (or whichever app houses it): Login/Auth -> Dashboard -> Order list/detail -> RSVP management -> Guest management -> Memory access.
   - Identify dead ends, broken navigation links, missing forms, mock data vs real data, or incomplete states.
2. Guest Journeys:
   - RSVP submission flow (view invitation -> fill RSVP form -> receive confirmation/pass).
   - Event Pass / QR code viewing and pass verification scanner (apps/Invitation/scanner, passes).
   - Dynamic site viewing (apps/Renderer or apps/Invitation) including wishing wall interaction.
3. Arabic-First Admin Dashboard Redesign (apps/Admin):
   - Current structure, navigation sidebar/header, routing, pages (Plans, Orders, Payments, Booth Memory Studio, Invitation Studio, Users/Settings).
   - Current layout direction (LTR vs RTL) and current language (English vs Arabic).
   - Exact redesign requirements to make it native Arabic-first (RTL `dir="rtl"`, Arabic typography Cairo/Amiri, Arabic labels, intuitive navigation, operational management views, and robust error-free state).

Constraints:
- You are a read-only exploration agent.
- NEVER modify or create application source files.
- NEVER run npm run build or unnecessary build commands.
- DO NOT create scripts or code generators unless strictly necessary for read-only exploration.
- Write your comprehensive findings to: d:\asar\.agents\teamwork\explorer_survey_3\user_journey_admin_survey_report.md
- Write your handoff to: d:\asar\.agents\teamwork\explorer_survey_3\handoff.md
- When complete, use send_message to report back to your caller (parent). Include the path to your reports.
