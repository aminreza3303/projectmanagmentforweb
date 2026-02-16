<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="workspace-switch">
        <span class="workspace-name">PM Workspace</span>
        <span class="workspace-arrow">v</span>
      </div>

      <div class="sidebar-section">
        <div class="section-title">Favorites</div>
        <router-link class="nav-item" to="/projects">Projects</router-link>
        <router-link class="nav-item" to="/resources">Resources</router-link>
        <router-link class="nav-item" to="/financial-resources">Financial Resources</router-link>
        <router-link class="nav-item" to="/reports">Reports</router-link>
      </div>

      <div class="sidebar-section">
        <div class="section-title">Teamspaces</div>
        <router-link class="nav-item" to="/projects">Management Team</router-link>
      </div>

      <div class="sidebar-section">
        <div class="section-title">Shared</div>
        <router-link class="nav-item" to="/notifications">Inbox</router-link>
      </div>

      <div v-if="auth.user?.role === 'admin'" class="sidebar-section">
        <div class="section-title">Admin</div>
        <router-link class="nav-item" to="/admin/users">Users</router-link>
        <router-link class="nav-item" to="/admin/roles">Roles</router-link>
      </div>

      <div class="sidebar-section">
        <div class="section-title">Private</div>
        <router-link class="nav-item" to="/profile">Profile</router-link>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
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
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
const logout = () => auth.logout();
</script>
