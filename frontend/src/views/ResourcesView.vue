<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Project {{ id }} Resources</h2>
        <div class="text-muted small">Database view</div>
      </div>
      <router-link class="btn btn-outline-secondary" :to="`/projects/${id}`">Back</router-link>
    </div>
    <div class="view-tabs">
      <span class="view-tab">Table</span>
      <span class="view-tab">Board</span>
    </div>

    <div v-if="canManageResources" class="card-plain mb-3">
      <form @submit.prevent="createResource">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted">Catalog item</label>
            <select v-model="form.resource_item_id" class="form-select">
              <option value="">Select from catalog</option>
              <option v-for="c in catalog" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.type }})
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Task (optional)</label>
            <select v-model="form.task_id" class="form-select">
              <option value="">Assign to task (optional)</option>
              <option v-for="t in tasks" :key="t.id" :value="t.id">
                {{ t.title }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Type</label>
            <input v-model="form.type" class="form-control" placeholder="Type" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Name</label>
            <input v-model="form.name" class="form-control" placeholder="Name" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Amount</label>
            <input v-model="form.amount" type="number" class="form-control" placeholder="Amount" required />
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-3">
            <label class="form-label small text-muted">Unit</label>
            <input v-model="form.unit" class="form-control" placeholder="Unit" />
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Add resource</button>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Allocation Summary</strong>
        <span class="text-muted small">Percent of total allocated</span>
      </div>
      <div v-if="summary.length === 0" class="text-muted small">No resources allocated yet.</div>
      <div v-for="item in summary" :key="item.label" class="mb-2">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="me-2">{{ item.label }}</span>
            <span v-if="item.low" class="badge bg-danger">Low</span>
          </div>
          <div class="text-muted small">{{ item.amount }}</div>
        </div>
        <div class="progress" style="height: 8px;">
          <div class="progress-bar" :style="{ width: item.percent + '%' }"></div>
        </div>
      </div>
      <div class="mt-3">
        <canvas ref="summaryChartRef" height="160"></canvas>
      </div>
    </div>

    <div v-if="canManageResources" class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Equipment Catalog</strong>
      </div>
      <div class="row g-2">
        <div class="col-md-4">
          <label class="form-label small text-muted">Name</label>
          <input v-model="catalogForm.name" class="form-control" placeholder="Name" />
        </div>
        <div class="col-md-4">
          <label class="form-label small text-muted">Type</label>
          <input v-model="catalogForm.type" class="form-control" placeholder="Type" />
        </div>
        <div class="col-md-2">
          <label class="form-label small text-muted">Unit</label>
          <input v-model="catalogForm.unit" class="form-control" placeholder="Unit" />
        </div>
        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100" @click="createCatalogItem">Add</button>
        </div>
      </div>

      <table class="table-lite mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in catalog" :key="c.id">
            <td>{{ c.name }}</td>
            <td>{{ c.type }}</td>
            <td>{{ c.unit || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <table class="table-lite">
      <thead>
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>Amount</th>
          <th>Unit</th>
          <th>Task</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in resources" :key="r.id">
          <td>{{ r.resourceItem?.type || r.type }}</td>
          <td>{{ r.resourceItem?.name || r.name }}</td>
          <td>{{ r.amount }}</td>
          <td>{{ r.resourceItem?.unit || r.unit }}</td>
          <td>{{ r.task?.title || "-" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { Chart, ArcElement, Tooltip, Legend, PieController } from "chart.js";
import { useRoute } from "vue-router";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";

Chart.register(ArcElement, Tooltip, Legend, PieController);

const route = useRoute();
const id = route.params.id;
const resources = ref([]);
const catalog = ref([]);
const tasks = ref([]);
const error = ref("");
const auth = useAuthStore();
const ui = useUiStore();
const summaryChartRef = ref(null);
let summaryChart = null;
const form = reactive({
  resource_item_id: "",
  task_id: "",
  type: "",
  name: "",
  amount: 0,
  unit: ""
});
const catalogForm = reactive({ name: "", type: "", unit: "" });
const summary = computed(() => {
  const totals = new Map();
  let overall = 0;
  resources.value.forEach((r) => {
    const label = r.resourceItem?.name || r.name || r.type || "Resource";
    const amount = Number(r.amount) || 0;
    totals.set(label, (totals.get(label) || 0) + amount);
    overall += amount;
  });
  return Array.from(totals.entries()).map(([label, amount]) => ({
    label,
    amount,
    percent: overall ? Math.round((amount / overall) * 100) : 0,
    low: amount <= 1
  }));
});
const canManageResources = computed(
  () => auth.user?.role === "admin" || auth.user?.role === "manager"
);
const palette = [
  "#2f6fed",
  "#f6c343",
  "#12b886",
  "#fa5252",
  "#7950f2",
  "#15aabf",
  "#fd7e14",
  "#868e96"
];

const chartTextColor = () => {
  if (typeof window === "undefined") return "#1f1f1f";
  const color = getComputedStyle(document.documentElement).getPropertyValue("--text").trim();
  return color || "#1f1f1f";
};

const renderSummaryChart = async () => {
  await nextTick();
  if (!summaryChartRef.value) return;
  if (summaryChart) {
    summaryChart.destroy();
    summaryChart = null;
  }
  if (!summary.value.length) return;
  summaryChart = new Chart(summaryChartRef.value, {
    type: "pie",
    data: {
      labels: summary.value.map((s) => s.label),
      datasets: [
        {
          data: summary.value.map((s) => s.amount),
          backgroundColor: summary.value.map((_, i) => palette[i % palette.length])
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: chartTextColor() } }
      }
    }
  });
};

const load = async () => {
  try {
    const { data } = await api.get(`/api/projects/${id}/resources`);
    resources.value = data;
    await renderSummaryChart();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load resources";
  }
};

const loadCatalog = async () => {
  try {
    const { data } = await api.get("/api/resources/catalog");
    catalog.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load resource catalog";
  }
};

const loadTasks = async () => {
  if (!canManageResources.value) return;
  try {
    const { data } = await api.get(`/api/projects/${id}/tasks`);
    tasks.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load tasks";
  }
};

const createResource = async () => {
  error.value = "";
  try {
    await api.post(`/api/projects/${id}/resources`, {
      resourceItemId: form.resource_item_id ? Number(form.resource_item_id) : undefined,
      task_id: form.task_id ? Number(form.task_id) : undefined,
      type: form.type,
      name: form.name,
      amount: Number(form.amount),
      unit: form.unit
    });
    form.resource_item_id = "";
    form.task_id = "";
    form.type = "";
    form.name = "";
    form.amount = 0;
    form.unit = "";
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to create resource";
  }
};

const createCatalogItem = async () => {
  error.value = "";
  try {
    await api.post("/api/resources/catalog", {
      name: catalogForm.name,
      type: catalogForm.type,
      unit: catalogForm.unit
    });
    catalogForm.name = "";
    catalogForm.type = "";
    catalogForm.unit = "";
    await loadCatalog();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to add catalog item";
  }
};

onMounted(async () => {
  await load();
  await loadCatalog();
  await loadTasks();
});

watch(
  () => ui.theme,
  () => {
    void renderSummaryChart();
  }
);

onBeforeUnmount(() => {
  if (summaryChart) summaryChart.destroy();
});
</script>
