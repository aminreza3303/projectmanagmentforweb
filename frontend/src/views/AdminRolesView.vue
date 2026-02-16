<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Admin - Roles</h2>
        <div class="text-muted small">Role overview</div>
      </div>
      <router-link class="btn btn-outline-secondary" to="/admin/users">Go to Users</router-link>
    </div>

    <div class="card-plain">
      <p class="mb-2">Roles are managed via the Users page.</p>
      <ul class="mb-0">
        <li>admin: full access</li>
        <li>manager: manage projects/tasks/resources</li>
        <li>member: view assigned tasks and project updates</li>
      </ul>
    </div>
  </div>
</template>
