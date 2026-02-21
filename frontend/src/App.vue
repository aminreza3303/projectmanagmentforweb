<template>
  <div v-if="isPublicRoute" class="auth-layout">
    <main class="auth-content">
      <router-view />
    </main>
  </div>

  <div v-else class="app-shell" :class="{ 'sidebar-mini': ui.sidebarMini }">
    <aside class="sidebar">
      <router-link to="/dashboard" class="workspace-switch workspace-home-link" title="Go to home">
        <span class="workspace-name">{{ ui.sidebarMini ? "PM" : "PM Workspace" }}</span>
        <span v-if="!ui.sidebarMini" class="workspace-arrow">v</span>
      </router-link>

      <div class="sidebar-nav">
        <div v-for="section in navSections" :key="section.key" class="sidebar-section">
          <router-link
            v-for="item in section.items"
            :key="`${section.key}-${item.label}-${item.to}`"
            class="nav-item"
            :to="item.to"
            :title="item.label"
          >
            <span class="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path v-for="(path, idx) in iconPaths(item.icon)" :key="idx" :d="path" />
              </svg>
            </span>
            <span v-if="!ui.sidebarMini" class="nav-label">{{ item.label }}</span>
          </router-link>
        </div>
      </div>

      <div class="sidebar-footer">
        <button
          type="button"
          class="sidebar-action"
          :title="sidebarToggleLabel"
          :aria-label="sidebarToggleLabel"
          @click="ui.toggleSidebarMini()"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                v-for="(path, idx) in iconPaths(ui.sidebarMini ? 'expand' : 'collapse')"
                :key="idx"
                :d="path"
              />
            </svg>
          </span>
          <span v-if="!ui.sidebarMini" class="nav-label">{{ sidebarToggleLabel }}</span>
        </button>

        <button
          type="button"
          class="sidebar-action"
          :title="themeToggleLabel"
          :aria-label="themeToggleLabel"
          @click="ui.toggleTheme()"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                v-for="(path, idx) in iconPaths(ui.theme === 'dark' ? 'theme-light' : 'theme-dark')"
                :key="idx"
                :d="path"
              />
            </svg>
          </span>
          <span v-if="!ui.sidebarMini" class="nav-label">{{ themeToggleLabel }}</span>
        </button>
      </div>
    </aside>

    <aside
      id="mobile-sidebar"
      class="mobile-sidebar"
      :class="{ open: isMobileNavOpen }"
      :aria-hidden="!isMobileNavOpen"
    >
      <div class="mobile-sidebar-header">
        <router-link
          to="/dashboard"
          class="workspace-switch workspace-home-link"
          title="Go to home"
          @click="closeMobileNav"
        >
          <span class="workspace-name">PM Workspace</span>
          <span class="workspace-arrow">v</span>
        </router-link>
        <button
          type="button"
          class="mobile-sidebar-close"
          aria-label="Close navigation"
          @click="closeMobileNav"
        >
          x
        </button>
      </div>

      <div class="mobile-sidebar-nav">
        <div v-for="section in navSections" :key="`mobile-${section.key}`" class="sidebar-section">
          <router-link
            v-for="item in section.items"
            :key="`mobile-${section.key}-${item.label}-${item.to}`"
            class="nav-item"
            :to="item.to"
            @click="closeMobileNav"
          >
            <span class="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path v-for="(path, idx) in iconPaths(item.icon)" :key="idx" :d="path" />
              </svg>
            </span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </div>
      </div>

      <div class="mobile-sidebar-footer">
        <button
          type="button"
          class="sidebar-action"
          :aria-label="sidebarToggleLabel"
          @click="ui.toggleSidebarMini()"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                v-for="(path, idx) in iconPaths(ui.sidebarMini ? 'expand' : 'collapse')"
                :key="idx"
                :d="path"
              />
            </svg>
          </span>
          <span class="nav-label">{{ sidebarToggleLabel }}</span>
        </button>

        <button
          type="button"
          class="sidebar-action"
          :aria-label="themeToggleLabel"
          @click="ui.toggleTheme()"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                v-for="(path, idx) in iconPaths(ui.theme === 'dark' ? 'theme-light' : 'theme-dark')"
                :key="idx"
                :d="path"
              />
            </svg>
          </span>
          <span class="nav-label">{{ themeToggleLabel }}</span>
        </button>
      </div>
    </aside>

    <button
      v-if="isMobileNavOpen"
      type="button"
      class="mobile-overlay"
      aria-label="Close navigation overlay"
      @click="closeMobileNav"
    ></button>

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <button
            type="button"
            class="mobile-menu-btn"
            aria-controls="mobile-sidebar"
            :aria-expanded="isMobileNavOpen ? 'true' : 'false'"
            aria-label="Toggle navigation menu"
            @click="toggleMobileNav"
          >
            <span class="menu-icon" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        <div class="topbar-actions">
          <span v-if="auth.user?.name" class="pill">
            {{ auth.user.name }}
          </span>
          <button v-if="auth.token" class="btn btn-sm btn-outline-secondary" @click="logout">
            Log out
          </button>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { useUiStore } from "./stores/ui";
import api from "./api/client";

const MOBILE_BREAKPOINT = 992;
const auth = useAuthStore();
const ui = useUiStore();
const route = useRoute();
const router = useRouter();
const isMobileNavOpen = ref(false);
const isPublicRoute = computed(() => Boolean(route.meta?.public));
let tableObserver = null;

const coreSections = [
  {
    key: "favorites",
    title: "Favorites",
    items: [
      { label: "Projects", to: "/projects", icon: "projects" },
      { label: "Resources", to: "/resources", icon: "resources" },
      { label: "Financial Resources", to: "/financial-resources", icon: "financial" },
      { label: "Reports", to: "/reports", icon: "reports" }
    ]
  },
  {
    key: "teamspaces",
    title: "Teamspaces",
    items: [{ label: "Management Team", to: "/management-team", icon: "team" }]
  },
  {
    key: "shared",
    title: "Shared",
    items: [{ label: "Inbox", to: "/notifications", icon: "inbox" }]
  }
];

const adminSection = {
  key: "admin",
  title: "Admin",
  items: [
    { label: "Users", to: "/admin/users", icon: "users" },
    { label: "Roles", to: "/admin/roles", icon: "roles" }
  ]
};

const privateSection = {
  key: "private",
  title: "Private",
  items: [{ label: "Profile", to: "/profile", icon: "profile" }]
};

const navSections = computed(() => {
  const sections = [...coreSections];
  if (auth.user?.role === "admin") {
    sections.push(adminSection);
  }
  sections.push(privateSection);
  return sections;
});

const sidebarToggleLabel = computed(() =>
  ui.sidebarMini ? "Expand sidebar" : "Collapse sidebar"
);
const themeToggleLabel = computed(() =>
  ui.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
);

const navIconMap = {
  projects: ["M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z", "M8 9v6", "M12 9v3", "M16 9v8"],
  resources: ["M3 8L12 3l9 5-9 5-9-5Z", "M3 8v8l9 5 9-5V8", "M12 13v8"],
  financial: ["M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z", "M16 12h3", "M16 10a2 2 0 0 0 0 4"],
  reports: ["M4 19h16", "M8 16V10", "M12 16V6", "M16 16v-4"],
  team: ["M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M14 7a3 3 0 1 1 0 6", "M20 21v-2a4 4 0 0 0-3-3.87", "M17 3a3 3 0 0 1 0 6"],
  inbox: ["M3 5h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z", "M3 13h5l2 3h4l2-3h5"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  roles: ["M12 3l7 3v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z", "M9.5 12.5l2 2 3-4"],
  profile: ["M20 21a8 8 0 1 0-16 0", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  collapse: ["M4 5h16v14H4z", "M9 8l-3 4 3 4", "M13 8v8"],
  expand: ["M4 5h16v14H4z", "M15 8l3 4-3 4", "M11 8v8"],
  "theme-dark": ["M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"],
  "theme-light": [
    "M12 3v2",
    "M12 19v2",
    "M4.9 4.9l1.4 1.4",
    "M17.7 17.7l1.4 1.4",
    "M3 12h2",
    "M19 12h2",
    "M4.9 19.1l1.4-1.4",
    "M17.7 6.3l1.4-1.4",
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
  ],
  default: ["M4 5h16v14H4z", "M8 9h8", "M8 13h8"]
};

const iconPaths = (icon) => navIconMap[icon] || navIconMap.default;

const setBodyScrollLock = (locked) => {
  document.body.classList.toggle("no-scroll", locked);
};

const closeMobileNav = () => {
  isMobileNavOpen.value = false;
};

const openMobileNav = () => {
  isMobileNavOpen.value = true;
};

const toggleMobileNav = () => {
  if (isMobileNavOpen.value) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
};

const handleResize = () => {
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    closeMobileNav();
  }
};

const handleKeyDown = (event) => {
  if (event.key === "Escape") {
    closeMobileNav();
  }
};

const applyResponsiveTableLabels = () => {
  const tables = document.querySelectorAll("table.table-lite");
  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      (th.textContent || "").trim()
    );
    if (!headers.length) return;

    table.querySelectorAll("tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, idx) => {
        const label = headers[idx] || `Column ${idx + 1}`;
        if (cell.getAttribute("data-label") !== label) {
          cell.setAttribute("data-label", label);
        }
      });
    });
  });
};

const initTableObserver = () => {
  if (typeof MutationObserver === "undefined") return;
  const root = document.querySelector(".content");
  if (!root) return;

  tableObserver = new MutationObserver(() => {
    applyResponsiveTableLabels();
  });

  tableObserver.observe(root, {
    childList: true,
    subtree: true
  });
};

watch(
  () => route.fullPath,
  () => {
    closeMobileNav();
    nextTick(() => {
      applyResponsiveTableLabels();
    });
  }
);

watch(isPublicRoute, (value) => {
  if (value) {
    closeMobileNav();
  }
});

watch(isMobileNavOpen, (value) => {
  setBodyScrollLock(value && !isPublicRoute.value);
});

onMounted(() => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeyDown);
  handleResize();
  nextTick(() => {
    applyResponsiveTableLabels();
    initTableObserver();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeyDown);
  setBodyScrollLock(false);
  if (tableObserver) {
    tableObserver.disconnect();
    tableObserver = null;
  }
});

const logout = () => {
  closeMobileNav();
  const token = auth.token;
  if (token) {
    void api
      .post("/api/auth/logout", null, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .catch(() => {});
  }
  auth.logout();
  void router.replace("/login");
};
</script>
