<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Reports</h2>
        <div class="text-muted small">Database view</div>
      </div>
    </div>
    <div class="view-tabs">
      <span class="view-tab">Table</span>
      <span class="view-tab">Board</span>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Summary</strong>
      </div>
      <div v-if="summary" class="row g-2">
        <div class="col-md-3">
          <div class="card-plain">
            <div class="text-muted small">Projects</div>
            <div class="fs-4 fw-bold">{{ summary.projects }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-plain">
            <div class="text-muted small">Tasks</div>
            <div class="fs-4 fw-bold">{{ summary.tasks }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-plain">
            <div class="text-muted small">Budget Total</div>
            <div class="fs-4 fw-bold">{{ summary.budgetTotal }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-plain">
            <div class="text-muted small">Spent Total</div>
            <div class="fs-4 fw-bold">{{ summary.spentTotal }}</div>
          </div>
        </div>
      </div>
      <div v-if="summary" class="mt-2">
        <div class="text-muted small mb-1">Tasks by Status</div>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(count, status) in summary.tasksByStatus" :key="status" class="badge bg-secondary">
            {{ status }}: {{ count }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="canManageReports" class="card-plain mb-3">
      <form @submit.prevent="createReport">
        <div class="row g-2">
          <div class="col-md-3">
            <input v-model="form.project_id" type="number" class="form-control" placeholder="Project ID" required />
          </div>
          <div class="col-md-3">
            <input v-model="form.type" class="form-control" placeholder="Report type" required />
          </div>
          <div class="col-md-6">
            <input v-model="form.content" class="form-control" placeholder="Summary" required />
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Create report</button>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <table class="table-lite">
      <thead>
        <tr>
          <th>Project</th>
          <th>Type</th>
          <th>Content</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reports" :key="r.id">
          <td>{{ r.projectId }}</td>
          <td>{{ r.type }}</td>
          <td>{{ r.content }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const reports = ref([]);
const error = ref("");
const form = reactive({ project_id: 1, type: "progress", content: "" });
const summary = ref(null);
const auth = useAuthStore();
const canManageReports = computed(
  () => auth.user?.role === "admin" || auth.user?.role === "manager"
);

const load = async () => {
  try {
    const { data } = await api.get("/api/reports");
    reports.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load reports";
  }
};

const loadSummary = async () => {
  try {
    const { data } = await api.get("/api/reports/summary");
    summary.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load summary";
  }
};

const createReport = async () => {
  error.value = "";
  try {
    await api.post("/api/reports", {
      project_id: Number(form.project_id),
      type: form.type,
      content: form.content
    });
    form.content = "";
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to create report";
  }
};

onMounted(async () => {
  await loadSummary();
  await load();
});
</script>
