Phase 5 – Front‑End Implementation (Vue 3 + Vite + Bootstrap)

Pages
- Login: frontend/src/views/LoginView.vue
- Register: frontend/src/views/RegisterView.vue
- Dashboard: frontend/src/views/DashboardView.vue
- Profile: frontend/src/views/ProfileView.vue
- Projects: frontend/src/views/ProjectsView.vue
- Project Detail: frontend/src/views/ProjectDetailView.vue
- Tasks: frontend/src/views/TasksView.vue
- Resources: frontend/src/views/ResourcesView.vue
- Reports: frontend/src/views/ReportsView.vue
- Notifications: frontend/src/views/NotificationsView.vue

API Integration
- Axios client: frontend/src/api/client.js
- Token handling: frontend/src/stores/auth.js
- Base URL: VITE_API_BASE_URL in .env

Run
```
cd frontend
npm install
cp .env.example .env
npm run dev
```

Notes
- Front‑end is fully separate and connects via API.
- UI layout follows a Notion‑inspired structure.
