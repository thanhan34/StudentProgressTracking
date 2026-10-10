# PTE Intensive — Product Context

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed during initialization: the primary audience is internal staff—administrators, instructors, and teaching assistants. Students are tracked by staff, not primary app users. Do not introduce student-facing workflows without a separate confirmed requirement.

Audience terminology is not identical to the implemented authorization model. The current account roles are Administrator, Admin Assistant, Teaching Assistant, Reserve Teaching Assistant, and Pending Approval; instructor assignments exist in student records. Do not invent an instructor authorization role.

## Product Purpose

Help PTE Intensive staff monitor PTE Academic students' learning progress, coordinate instructional support, maintain weekly reports, and track preparation toward target scores and planned exam dates.

The purpose and workflows are supported by the existing repository and the user's confirmation of the staff audience. Quantitative success measures have not been specified.

## Operating Context

- The current interface and product documentation are primarily Vietnamese; retain established Vietnamese labels and PTE terminology.
- Staff use a dashboard to find and filter students, review progress, open profiles, and export CSV data.
- Student profiles contain start dates, planned exam dates, target scores, assigned instructors and assistants, independently selected tags, and per-student PTE tasks.
- Staff maintain task progress and weekly reports. Historical weekly task snapshots must remain distinct from current task progress.
- The recognition workflow displays students recorded as having passed and instructor rankings by month or year, with the documented limitations of current assignments and historical data.
- Access requires Clerk authentication and an approved account; pending accounts follow the approval flow.

## Capabilities and Constraints

The following implementation facts are grounded in the repository:

- Existing stack: Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons, Clerk, and Firebase Firestore. Extend the installed stack rather than introducing alternatives by default.
- Student CRUD, task management, and weekly reports persist to Firestore. Do not substitute demo data or localStorage when loading or saving fails.
- Loading, empty, failure, and save states must remain distinguishable. Inline edits retain drafts on failure and support retry or undo; respect pending saves before leaving a profile.
- Student tags are independent of report status and exam evaluations; do not infer them from scores.
- Multiple instructors and assistants can be assigned. Preserve account IDs where available; equal names alone do not prove equal identities.
- Current task edits do not rewrite old weekly progress snapshots. Preserve the documented task rename and deletion behavior.
- Deletion requires confirmation. Existing score, date, required-field, and task-code validation must remain intact.
- Internal student IDs are not displayed as student codes. Creating a student does not require an email address or phone number; preserve legacy contact data on updates.
- Pass dates and recognition rankings use recorded data, not planned exam dates or current scores as proof of an official result. Do not invent dates for legacy records or claim historical role snapshots that are not stored.
- Do not overwrite environment configuration, disclose secrets, or weaken authentication or approval controls as part of UI work.

## Brand Commitments

The existing product name is PTE Intensive. The project's established UI is the source of truth for future refinements: preserve its recognizable identity and reuse existing visual and interaction patterns rather than imposing a replacement theme. Initialization does not select a new visual direction or authorize a redesign.

## Evidence on Hand

- `README.md`: product workflows, Vietnamese terminology, persistence guarantees, validation rules, and reporting limitations.
- `app/page.tsx`, `app/layout.tsx`, and `components/`: current application entry, Vietnamese document language, and incumbent UI implementation.
- `app/globals.css`: incumbent styling and reusable design tokens; consult it before future UI changes.
- `lib/auth.ts` and `lib/roles.ts`: authentication, approval requirements, and implemented account roles.
- `data/students.ts`: student types, not demo students or proof of outcomes.

No user-confirmed testimonials, performance benchmarks, or marketing claims were supplied during initialization. Do not fabricate them or treat source code as evidence of measured learning outcomes.

## Product Principles

1. Optimize for staff coordination and student-progress tracking, not an unrequested student portal.
2. Reflect persisted data honestly; expose empty and failure states instead of masking them with invented records.
3. Protect reporting history and preserve the distinction between current progress, planned exams, and recorded pass outcomes.
4. Make edits and destructive actions clear, recoverable where supported, and safe around pending saves.
5. Preserve Vietnamese terminology, existing identity, and approved-account access when extending the product.

## Open Decisions

- Quantitative success metrics and prioritization among staff workflows have not been specified.
- No product-specific accessibility compliance standard or additional assistive-technology needs were confirmed. Existing keyboard focus, responsive behavior, and accessible controls must not regress.
- No new student-facing functionality, redesign, or marketing surface was requested.