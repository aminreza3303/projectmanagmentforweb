# Gap Tasks (Prioritized)

## P0 — Core Behavior & Data
- [x] Implement activity history/audit log for key actions (projects, tasks, resources, files, notifications).
- [x] Add automatic notifications for task status/date changes and project date changes.
- [x] Add low-resource alerts based on configurable thresholds.

## P1 — Admin & Access UI
- [x] Add Admin users management page (`/admin/users`) for create/edit/delete users and role updates.
- [x] Add Admin roles page (`/admin/roles`) or integrate role management into users page.

## P1 — Reports & Visualization
- [x] Add real charts (bar/pie) for reports and resource allocation summaries.

## P2 — UX & Sitemap Completeness
- [x] Add dedicated task detail route (`/tasks/:id`) and edit view (`/tasks/:id/edit`) or update sitemap docs to reflect inline editing.
- [x] Add report detail route (`/reports/:id`) or update sitemap docs to match current behavior.
- [x] Add global resources page (`/resources`) or update sitemap docs to project-scoped resources only.
- [x] Add notifications filters (All/Unread) and UX states (loading/success/empty where missing).

## P2 — Documentation Alignment
- [x] Update `phase2_sitemap.md` to match actual implemented routes if not adding missing pages.
- [x] Update `plan_prisma_stack.md` Phase 7 status for Notifications/Files (currently implemented).
- [x] Add ESLint/Prettier config or update docs to remove requirement.
