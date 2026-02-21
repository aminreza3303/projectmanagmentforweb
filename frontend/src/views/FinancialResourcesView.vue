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
          <div class="stat-label">Allocated budget spent</div>
          <div class="stat-value">{{ allocatedUsedPercent }}%</div>
          <div class="text-muted small">${{ spentTotal }} spent</div>
          <div class="progress-track mt-1">
            <div class="progress-fill bg-success" :style="{ width: `${allocatedUsedPercent}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAdmin" class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Manage system funds (admin only)</strong>
      </div>
      <form @submit.prevent="increaseBudget" class="row g-2 align-items-end">
        <div class="col-md-5">
          <label class="form-label small text-muted">Amount (USD)</label>
          <input
            v-model="budgetAmount"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="form-control"
            placeholder="1 - 1,000,000"
            @input="sanitizeBudgetAmount"
          />
          <div class="text-muted small mt-1">Whole dollars only (no decimals).</div>
          <div class="text-muted small">Max removable now: ${{ maxDecrease }}</div>
        </div>
        <div class="col-md-5 d-flex gap-2 flex-wrap">
          <button class="btn btn-outline-secondary">Add to system</button>
          <button type="button" class="btn btn-outline-danger" @click="decreaseBudget">
            Remove from system
          </button>
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
const budgetAmount = ref("");
const auth = useAuthStore();
const isAdmin = computed(() => auth.user?.role === "admin");
const MIN_BUDGET_CHANGE = 1;
const MAX_BUDGET_CHANGE = 1_000_000;

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

const spentTotal = computed(() =>
  projects.value.reduce((sum, project) => sum + (Number(project.spent) || 0), 0)
);
const allocatedUsedPercent = computed(() => {
  if (!globalBudget.allocated) return 0;
  const ratio = (spentTotal.value / globalBudget.allocated) * 100;
  return Number.isFinite(ratio) ? Math.min(100, Number(ratio.toFixed(2))) : 0;
});
const maxDecrease = computed(() => Math.max(0, Math.floor(globalBudget.total - globalBudget.allocated)));

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (err?.message) return err.message;
  return fallback;
};

const loadGlobalBudget = async () => {
  try {
    const { data } = await api.get("/api/budget");
    globalBudget.total = data.total || 0;
    globalBudget.allocated = data.allocated || 0;
    globalBudget.available = data.available || 0;
  } catch (err) {
    error.value = getErrorMessage(err, "Failed to load global budget");
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
    error.value = getErrorMessage(err, "Failed to load projects");
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.q = "";
  filters.status = "";
  load();
};

const sanitizeBudgetAmount = () => {
  budgetAmount.value = String(budgetAmount.value || "")
    .replace(/[^\d]/g, "")
    .slice(0, 7);
};

const parseBudgetAmount = () => {
  const amount = Number(budgetAmount.value);

  if (!Number.isInteger(amount)) {
    error.value = "Amount must be a whole dollar value.";
    return null;
  }

  if (amount < MIN_BUDGET_CHANGE || amount > MAX_BUDGET_CHANGE) {
    error.value = `Amount must be between ${MIN_BUDGET_CHANGE} and ${MAX_BUDGET_CHANGE} USD.`;
    return null;
  }

  return amount;
};

const increaseBudget = async () => {
  error.value = "";
  const amount = parseBudgetAmount();
  if (!amount) return;

  try {
    await api.post("/api/budget/increase", { amount });
    budgetAmount.value = "";
    await loadGlobalBudget();
  } catch (err) {
    error.value = getErrorMessage(err, "Failed to increase global budget");
  }
};

const decreaseBudget = async () => {
  error.value = "";
  const amount = parseBudgetAmount();
  if (!amount) return;
  if (amount > maxDecrease.value) {
    error.value = `Maximum removable amount right now is ${maxDecrease.value} USD.`;
    return;
  }

  try {
    await api.post("/api/budget/decrease", { amount });
    budgetAmount.value = "";
    await loadGlobalBudget();
  } catch (err) {
    error.value = getErrorMessage(err, "Failed to decrease global budget");
  }
};

onMounted(async () => {
  await load();
});
</script>
