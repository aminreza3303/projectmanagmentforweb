<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Profile</h2>
        <div class="text-muted small">User settings</div>
      </div>
    </div>
    <div class="card-plain mb-3">
      <div><strong>Name:</strong> {{ user?.name }}</div>
      <div><strong>Email:</strong> {{ user?.email }}</div>
      <div><strong>Role:</strong> {{ user?.role }}</div>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Assigned Tasks</strong>
      </div>
      <div v-if="tasks.length === 0" class="text-muted small">No tasks assigned.</div>
      <table v-else class="table-lite">
        <thead>
          <tr>
            <th>Title</th>
            <th>Project</th>
            <th>Status</th>
            <th>Due</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tasks" :key="t.id">
            <td>{{ t.title }}</td>
            <td>{{ t.project?.title || "-" }}</td>
            <td><span class="badge" :class="statusClass(t.status)">{{ t.status }}</span></td>
            <td>{{ formatDate(t.dueDate) }}</td>
            <td>{{ t.cost || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Completed Tasks</strong>
      </div>
      <div v-if="completedTasks.length === 0" class="text-muted small">No completed tasks.</div>
      <ul v-else class="list-unstyled mb-0">
        <li v-for="t in completedTasks" :key="t.id">
          {{ t.title }} ({{ t.project?.title || "-" }})
        </li>
      </ul>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Assigned Resources</strong>
      </div>
      <div v-if="resources.length === 0" class="text-muted small">No resources assigned.</div>
      <table v-else class="table-lite">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Project</th>
            <th>Task</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resources" :key="r.id">
            <td>{{ r.resourceItem?.name || r.name || r.type }}</td>
            <td>{{ r.project?.title || "-" }}</td>
            <td>{{ r.task?.title || "-" }}</td>
            <td>{{ r.amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Activity History</strong>
      </div>
      <div v-if="activities.length === 0" class="text-muted small">No activity yet.</div>
      <ul v-else class="list-unstyled mb-0">
        <li v-for="a in activities" :key="a.id">
          <span class="text-muted small">{{ formatDateTime(a.createdAt) }}</span>
          <span class="ms-2">{{ a.message }}</span>
          <span v-if="a.actor?.name" class="text-muted small ms-2">— {{ a.actor.name }}</span>
        </li>
      </ul>
    </div>

    <div class="card-plain">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Completed Projects</strong>
      </div>
      <div v-if="completedProjects.length === 0" class="text-muted small">
        No completed projects yet.
      </div>
      <ul v-else class="list-unstyled mb-0">
        <li v-for="p in completedProjects" :key="p.id">
          {{ p.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import api from "../api/client";

const auth = useAuthStore();
const user = computed(() => auth.user);
const tasks = ref([]);
const resources = ref([]);
const activities = ref([]);
const completedProjects = ref([]);
const completedTasks = computed(() => tasks.value.filter((t) => t.status === "done"));
const formatDate = (value) => (value ? String(value).slice(0, 10) : "-");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");
const statusClass = (status) =>
  ({
    todo: "bg-secondary",
    pending: "bg-warning text-dark",
    in_progress: "bg-primary",
    done: "bg-success",
    on_hold: "bg-dark"
  }[status] || "bg-secondary");

onMounted(async () => {
  try {
    const [
      { data: taskData },
      { data: resourceData },
      { data: projectData },
      { data: activityData }
    ] = await Promise.all([
      api.get("/api/users/me/tasks"),
      api.get("/api/users/me/resources"),
      api.get("/api/projects", { params: { status: "done" } }),
      api.get("/api/users/me/activity")
    ]);
    tasks.value = taskData;
    resources.value = resourceData;
    completedProjects.value = projectData;
    activities.value = activityData;
  } catch {
    // Silent fail to avoid blocking profile render
  }
});
</script>
