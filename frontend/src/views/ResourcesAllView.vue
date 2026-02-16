<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Resources</h2>
        <div class="text-muted small">All projects</div>
      </div>
      <button class="btn btn-outline-secondary" @click="load">Refresh</button>
    </div>

    <div v-if="!canView" class="alert alert-warning">
      You do not have access to this page.
    </div>

    <div v-else>
      <div v-if="loading" class="text-muted small mb-2">Loading resources...</div>
      <div v-if="error" class="text-danger small mb-2">{{ error }}</div>
      <div v-if="resources.length === 0" class="text-muted small">No resources found.</div>

      <table v-else class="table-lite">
        <thead>
          <tr>
            <th>Project</th>
            <th>Task</th>
            <th>Type</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resources" :key="r.id">
            <td>{{ r.project?.title || r.projectId }}</td>
            <td>{{ r.task?.title || "-" }}</td>
            <td>{{ r.resourceItem?.type || r.type }}</td>
            <td>{{ r.resourceItem?.name || r.name }}</td>
            <td>{{ r.amount }}</td>
            <td>{{ r.resourceItem?.unit || r.unit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const resources = ref([]);
const loading = ref(false);
const error = ref("");

const canView = computed(() => auth.user?.role === "admin" || auth.user?.role === "manager");

const load = async () => {
  if (!canView.value) return;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/api/resources");
    resources.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load resources";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await load();
});
</script>
