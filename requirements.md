Project Requirements - Project Management System

1) Overview
- Online project management platform for teams and project managers
- Manage projects, tasks, and resources (financial + equipment) efficiently
- Track progress, costs, and resource usage across projects

2) Roles
- Team Member:
  - View assigned tasks with details
  - Track and update task status
  - View assigned resources (financial/equipment)
  - View activity history and completed projects
- Project Manager:
  - Create/manage projects
  - Assign tasks to users
  - Allocate resources and budgets
  - Monitor progress and generate reports
- Admin (optional):
  - Manage users and access
  - Monitor system performance

3) Core Entities
- Projects: title, description, start/end dates, status, priority, budget, spent, manager
- Tasks: title, due date, status, assignee, resources, cost
- Resources: equipment catalog items + allocations to projects/tasks
- Financial resources: project budget, task cost, remaining budget
- Users: team members and project managers
- Reports & analytics: progress, resources, cost, team performance
- Notifications & messages: reminders and system updates

4) Front-End Pages
- User profile
  - Assigned tasks with details
  - Task statuses (todo / in_progress / done / on_hold)
  - Activity history and completed projects
  - Assigned resources (financial/equipment)
- Project management (manager)
  - Create project with title, start/end dates, priority, budget
  - View all projects with progress, resources, and dates
  - Edit projects and related tasks
  - Generate and view progress reports
- Project tasks
  - View tasks per project
  - Assign tasks to team members
  - Schedule tasks and track progress
  - Edit task dates, resources, and status
  - Visual status indicators for tasks
- Resource allocation (manual only)
  - Allocate financial and equipment resources to projects/tasks
  - Track usage and show allocation charts
  - Alerts when resources are low
- Reports
  - Progress, resources, and cost reports
  - Financial reports for budget vs. task costs
- Notifications & messages
  - Task reminders
  - Notifications on changes to dates or status

5) Back-End Features
- Authentication (register/login)
- Role management (authorization)
- Projects & tasks CRUD
- Status updates (projects + tasks) with role-based access
- Project scheduling (start/end dates) and task due-date validation
- Resource management (equipment catalog + allocations)
- Financial tracking (project budget, task cost, spent)
- Search & filter for projects and tasks
- File management for project documents
- Notifications & messages
- Reporting & analytics endpoints

6) Constraints
- Resource allocation is manual (no auto-allocation required)
- Task status: todo / pending / in_progress / done / on_hold
- Task assignment auto-adds assignees as project members
- Task due dates must fall within the project start/end date range
