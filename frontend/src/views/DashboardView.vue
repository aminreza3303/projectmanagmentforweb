<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Home</h2>
      <span class="pill">Workspace</span>
    </div>
    <div v-if="error" class="text-danger small mb-2">{{ error }}</div>
    <div class="row g-3">
      <div class="col-md-3" v-for="card in cards" :key="card.title">
        <div class="card-plain">
          <div class="text-muted">{{ card.title }}</div>
          <div class="fs-3 fw-bold">{{ card.value }}</div>
        </div>
      </div>
    </div>

    <div class="mt-4 card-plain">
      <h5>Recent tasks</h5>
      <table class="table-lite">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in recentTasks" :key="task.id">
            <td>{{ task.title }}</td>
            <td><span class="badge" :class="statusClass(task.status)">{{ task.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api/client";

const cards = ref([
  { title: "Projects", value: 0 },
  { title: "Tasks", value: 0 },
  { title: "In progress", value: 0 },
  { title: "Completed", value: 0 }
]);

const recentTasks = ref([]);
const error = ref("");
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
    const { data: projects } = await api.get("/api/projects");
    const { data: tasks } = await api.get("/api/users/me/tasks").catch(() => ({ data: [] }));

    cards.value[0].value = projects.length;
    cards.value[1].value = tasks.length;
    cards.value[2].value = tasks.filter((t) => t.status === "in_progress").length;
    cards.value[3].value = tasks.filter((t) => t.status === "done").length;

    recentTasks.value = tasks.slice(0, 5);
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load dashboard data";
  }
});
</script>
