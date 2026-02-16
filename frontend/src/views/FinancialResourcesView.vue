<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Financial Resources</h2>
        <div class="text-muted small">Project budgets in USD</div>
      </div>
      <button class="btn btn-outline-secondary" @click="load">Refresh</button>
    </div>

    <div class="card-plain mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small text-muted">Search</label>
          <input v-model="filters.q" class="form-control" placeholder="Search by project title" />
        </div>
        <div class="col-md-4">
          <label class="form-label small text-muted">Status</label>
          <select v-model="filters.status" class="form-select">
            <option value="">All</option>
            <option value="todo">todo</option>
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
            <option value="on_hold">on_hold</option>
          </select>
        </div>
        <div class="col-md-4 d-flex gap-2">
          <button class="btn btn-outline-secondary" @click="load">Apply filters</button>
          <button class="btn btn-outline-secondary" @click="resetFilters">Clear</button>
        </div>
      </div>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">Global budget (USD)</div>
          <div class="stat-value">${{ globalBudget.total }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">Allocated (USD)</div>
          <div class="stat-value">${{ globalBudget.allocated }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">Available (USD)</div>
          <div class="stat-value">${{ globalBudget.available }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">Allocation used</div>
          <div class="stat-value">{{ globalUsedPercent }}%</div>
          <div class="progress-track mt-1">
            <div class="progress-fill bg-success" :style="{ width: `${globalUsedPercent}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAdmin" class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Increase global budget (admin only)</strong>
      </div>
      <form @submit.prevent="increaseBudget" class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small text-muted">Amount (USD)</label>
          <input v-model="increaseAmount" type="number" min="0.01" class="form-control" placeholder="Amount (USD)" />
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-secondary">Increase</button>
        </div>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <div v-if="error" class="text-danger small mb-2">{{ error }}</div>
    <div v-if="loading" class="text-muted small mb-2">Loading budgets...</div>

    <div class="card-plain">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Project budgets</strong>
        <span class="text-muted small">USD</span>
      </div>
      <div class="text-muted small mb-2">
        Managers can allocate project budgets from the global budget. Tasks spend from the project
        budget.
      </div>
      <table class="table-lite">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Budget</th>
            <th>Spent</th>
            <th>Remaining</th>
            <th>% Used</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in projects" :key="p.id">
            <td>{{ p.title }}</td>
            <td><span class="badge" :class="statusClass(p.status)">{{ p.status }}</span></td>
            <td>${{ p.budget || 0 }}</td>
            <td>${{ p.spent || 0 }}</td>
            <td>${{ remaining(p) }}</td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <span>{{ usedPercent(p) }}%</span>
                <div class="progress-track" style="max-width: 120px;">
                  <div class="progress-fill bg-success" :style="{ width: `${usedPercent(p)}%` }"></div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!projects.length">
            <td colspan="6" class="text-muted small">No projects found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const projects = ref([]);
const loading = ref(false);
const error = ref("");
const filters = reactive({ q: "", status: "" });
const globalBudget = reactive({ total: 0, allocated: 0, available: 0 });
const increaseAmount = ref(0);
const auth = useAuthStore();
const isAdmin = computed(() => auth.user?.role === "admin");

const statusClass = (status) =>
  ({
    todo: "bg-secondary",
    pending: "bg-warning text-dark",
    in_progress: "bg-primary",
    done: "bg-success",
    on_hold: "bg-dark"
  }[status] || "bg-secondary");

const remaining = (p) => Math.max(0, (p.budget || 0) - (p.spent || 0));
const usedPercent = (p) =>
  p.budget ? Math.min(100, Math.round(((p.spent || 0) / p.budget) * 100)) : 0;

const globalUsedPercent = computed(() =>
  globalBudget.total
    ? Math.min(100, Math.round((globalBudget.allocated / globalBudget.total) * 100))
    : 0
);

const loadGlobalBudget = async () => {
  try {
    const { data } = await api.get("/api/budget");
    globalBudget.total = data.total || 0;
    globalBudget.allocated = data.allocated || 0;
    globalBudget.available = data.available || 0;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load global budget";
  }
};

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.status) params.status = filters.status;
    const { data } = await api.get("/api/projects", { params });
    projects.value = data;
    await loadGlobalBudget();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load projects";
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.q = "";
  filters.status = "";
  load();
};

const increaseBudget = async () => {
  error.value = "";
  if (!increaseAmount.value || increaseAmount.value <= 0) {
    error.value = "Amount must be greater than 0.";
    return;
  }
  try {
    await api.post("/api/budget/increase", { amount: Number(increaseAmount.value) });
    increaseAmount.value = 0;
    await loadGlobalBudget();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to increase global budget";
  }
};

onMounted(async () => {
  await load();
});
</script>
