<template>
  <div v-if="isPublicRoute" class="auth-layout">
    <main class="auth-content">
      <router-view />
    </main>
  </div>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="workspace-switch">
        <span class="workspace-name">PM Workspace</span>
        <span class="workspace-arrow">v</span>
      </div>

      <div v-for="section in navSections" :key="section.key" class="sidebar-section">
        <div class="section-title">{{ section.title }}</div>
        <router-link
          v-for="item in section.items"
          :key="`${section.key}-${item.label}-${item.to}`"
          class="nav-item"
          :to="item.to"
        >
          {{ item.label }}
        </router-link>
      </div>
    </aside>

    <aside
      id="mobile-sidebar"
      class="mobile-sidebar"
      :class="{ open: isMobileNavOpen }"
      :aria-hidden="!isMobileNavOpen"
    >
      <div class="mobile-sidebar-header">
        <div class="workspace-switch">
          <span class="workspace-name">PM Workspace</span>
          <span class="workspace-arrow">v</span>
        </div>
        <button
          type="button"
          class="mobile-sidebar-close"
          aria-label="Close navigation"
          @click="closeMobileNav"
        >
          x
        </button>
      </div>

      <div v-for="section in navSections" :key="`mobile-${section.key}`" class="sidebar-section">
        <div class="section-title">{{ section.title }}</div>
        <router-link
          v-for="item in section.items"
          :key="`mobile-${section.key}-${item.label}-${item.to}`"
          class="nav-item"
          :to="item.to"
          @click="closeMobileNav"
        >
          {{ item.label }}
        </router-link>
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
import { useRoute } from "vue-router";
import { useAuthStore } from "./stores/auth";

const MOBILE_BREAKPOINT = 992;
const auth = useAuthStore();
const route = useRoute();
const isMobileNavOpen = ref(false);
const isPublicRoute = computed(() => Boolean(route.meta?.public));
let tableObserver = null;

const coreSections = [
  {
    key: "favorites",
    title: "Favorites",
    items: [
      { label: "Projects", to: "/projects" },
      { label: "Resources", to: "/resources" },
      { label: "Financial Resources", to: "/financial-resources" },
      { label: "Reports", to: "/reports" }
    ]
  },
  {
    key: "teamspaces",
    title: "Teamspaces",
    items: [{ label: "Management Team", to: "/projects" }]
  },
  {
    key: "shared",
    title: "Shared",
    items: [{ label: "Inbox", to: "/notifications" }]
  }
];

const adminSection = {
  key: "admin",
  title: "Admin",
  items: [
    { label: "Users", to: "/admin/users" },
    { label: "Roles", to: "/admin/roles" }
  ]
};

const privateSection = {
  key: "private",
  title: "Private",
  items: [{ label: "Profile", to: "/profile" }]
};

const navSections = computed(() => {
  const sections = [...coreSections];
  if (auth.user?.role === "admin") {
    sections.push(adminSection);
  }
  sections.push(privateSection);
  return sections;
});

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
  auth.logout();
};
</script>
