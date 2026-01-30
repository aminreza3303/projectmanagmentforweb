Data Model (Proposed)

Entities
1) users
- id, name, email, password, role, created_at, updated_at

2) projects
- id, title, description, start_date, end_date, status, priority, budget, spent, manager_id
- manager_id -> users.id

3) project_members
- id, project_id, user_id

4) tasks
- id, project_id, title, description, due_date, status, priority, cost, assignee_id

5) resources
- id, project_id, task_id (nullable), resource_item_id (nullable), type, name, amount, unit, notes

6) resource_items
- id, name, type, unit, created_at

7) reports
- id, project_id, type, content, created_by, created_at

8) notifications
- id, user_id, title, body, read_at, created_at

9) files
- id, project_id, task_id (nullable), path, original_name, uploaded_by, created_at

Key Relations
- User 1..n Projects (as manager)
- User n..m Projects (as member via project_members)
- Project 1..n Tasks
- Task 1..n Resources (optional)
- ResourceItem 1..n Resources
- Project 1..n Reports
- User 1..n Notifications
- Project/Task 1..n Files

Notes
- role: admin | manager | member
- status: todo | pending | in_progress | done | on_hold
