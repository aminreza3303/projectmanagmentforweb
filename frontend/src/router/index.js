import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";
import ProfileView from "../views/ProfileView.vue";
import ProjectsView from "../views/ProjectsView.vue";
import ProjectDetailView from "../views/ProjectDetailView.vue";
import TasksView from "../views/TasksView.vue";
import ResourcesView from "../views/ResourcesView.vue";
import ReportsView from "../views/ReportsView.vue";
import NotificationsView from "../views/NotificationsView.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", component: LoginView, meta: { public: true } },
  { path: "/register", component: RegisterView, meta: { public: true } },
  { path: "/dashboard", component: DashboardView },
  { path: "/profile", component: ProfileView },
  { path: "/projects", component: ProjectsView },
  { path: "/projects/:id", component: ProjectDetailView, props: true },
  { path: "/projects/:id/tasks", component: TasksView, props: true },
  { path: "/projects/:id/resources", component: ResourcesView, props: true },
  { path: "/reports", component: ReportsView },
  { path: "/notifications", component: NotificationsView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.token) {
    return "/login";
  }
  if (auth.token && !auth.user) {
    await auth.fetchMe();
  }
  return true;
});

export default router;
