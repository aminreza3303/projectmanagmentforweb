<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Projects</h2>
        <div class="text-muted small">Database view</div>
      </div>
      <button
        v-if="canManageProjects"
        class="btn btn-outline-secondary"
        @click="showForm = !showForm"
      >
        New project
      </button>
    </div>
    <div class="view-tabs">
      <span
        class="view-tab"
        :class="{ active: viewMode === 'table' }"
        role="button"
        @click="viewMode = 'table'"
      >
        Table
      </span>
      <span
        class="view-tab"
        :class="{ active: viewMode === 'board' }"
        role="button"
        @click="viewMode = 'board'"
      >
        Board
      </span>
      <span
        class="view-tab"
        :class="{ active: viewMode === 'calendar' }"
        role="button"
        @click="viewMode = 'calendar'"
      >
        Calendar
      </span>
    </div>

    <div class="card-plain mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small text-muted">Search</label>
          <input v-model="filters.q" class="form-control" placeholder="Search by title" />
        </div>
        <div class="col-md-3">
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
        <div class="col-md-5 d-flex gap-2">
          <button class="btn btn-outline-secondary" @click="load">Apply filters</button>
          <button class="btn btn-outline-secondary" @click="resetFilters">Clear</button>
        </div>
      </div>
    </div>

    <div v-if="showForm && canManageProjects" class="card-plain mb-3">
      <form @submit.prevent="createProject">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted">Title</label>
            <input v-model="form.title" class="form-control" placeholder="Title" required />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Manager</label>
            <select v-model="form.manager_id" class="form-select" required>
              <option disabled value="">Select manager</option>
              <option v-for="m in managers" :key="m.id" :value="m.id">
                {{ m.name }} ({{ m.email }})
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Status</label>
            <select v-model="form.status" class="form-select">
              <option value="todo">todo</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
              <option value="on_hold">on_hold</option>
            </select>
          </div>
          <div v-if="canAllocateBudget" class="col-md-3">
            <label class="form-label small text-muted">Budget (USD)</label>
            <input v-model="form.budget" type="number" min="0" class="form-control" placeholder="Budget (USD)" />
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-3">
            <label class="form-label small text-muted">Priority</label>
            <input v-model="form.priority" type="number" min="0" class="form-control" placeholder="Priority" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Start date</label>
            <input v-model="form.start_date" type="date" class="form-control" placeholder="Start date" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">End date</label>
            <input v-model="form.end_date" type="date" class="form-control" placeholder="End date" />
          </div>
        </div>
        <div class="mt-2">
          <label class="form-label small text-muted">Description</label>
          <textarea v-model="form.description" class="form-control" placeholder="Description"></textarea>
        </div>
        <div class="mt-3">
          <div class="text-muted small mb-2">Required Resources</div>
          <div class="row g-2">
            <div class="col-md-6" v-for="item in resourceItems" :key="item.id">
              <div class="d-flex align-items-center gap-2">
                <input class="form-check-input" type="checkbox" v-model="resourceSelections[item.id].selected" />
                <span>{{ item.name }} ({{ item.type }})</span>
                <span class="text-muted small">Amount</span>
                <input
                  v-model="resourceSelections[item.id].amount"
                  type="number"
                  min="1"
                  class="form-control form-control-sm"
                  style="width: 90px;"
                  placeholder="Amount"
                  aria-label="Amount"
                  title="Amount"
                />
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Create project</button>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <div v-if="viewMode === 'table'">
      <table class="table-lite">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Dates</th>
            <th>Budget</th>
            <th>Spent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in projects" :key="p.id">
            <td>{{ p.title }}</td>
            <td>
              <div v-if="canUpdateStatus">
                <select
                  class="form-select form-select-sm d-inline-block"
                  style="width: 140px;"
                  :value="p.status"
                  @change="updateStatus(p.id, $event)"
                >
                  <option value="todo">todo</option>
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                  <option value="on_hold">on_hold</option>
                </select>
                <span class="badge ms-2" :class="statusClass(p.status)">{{ p.status }}</span>
              </div>
              <div v-else>
                <span class="badge" :class="statusClass(p.status)">{{ p.status }}</span>
              </div>
            </td>
            <td>{{ p.priority }}</td>
            <td>{{ formatDate(p.startDate) }} -> {{ formatDate(p.endDate) }}</td>
            <td>{{ p.budget }}</td>
            <td>{{ p.spent }}</td>
            <td>
              <router-link class="btn btn-sm btn-outline-primary" :to="`/projects/${p.id}`">Details</router-link>
              <button
                v-if="canManageProjects"
                class="btn btn-sm btn-outline-secondary ms-2"
                @click="startEdit(p)"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="viewMode === 'board'" class="board-grid">
      <div v-for="status in statuses" :key="status" class="board-column">
        <div class="board-column-title">
          {{ statusLabels[status] }} ({{ projectsByStatus[status].length }})
        </div>
        <div v-if="projectsByStatus[status].length === 0" class="text-muted small">Empty</div>
        <div v-for="p in projectsByStatus[status]" :key="p.id" class="board-card card-plain">
          <div class="fw-semibold">{{ p.title }}</div>
          <div class="small text-muted">Priority {{ p.priority ?? 0 }}</div>
          <div class="small text-muted">
            Dates: {{ formatDate(p.startDate) }} → {{ formatDate(p.endDate) }}
          </div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="badge" :class="statusClass(p.status)">{{ p.status }}</span>
            <router-link class="btn btn-sm btn-outline-primary" :to="`/projects/${p.id}`">
              Details
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'calendar'" class="calendar-grid">
      <div v-if="projectCalendar.length === 0" class="text-muted small">No dated projects.</div>
      <div v-for="bucket in projectCalendar" :key="bucket.dateKey" class="card-plain calendar-card">
        <div class="fw-semibold mb-1">{{ bucket.label }}</div>
        <div v-for="p in bucket.items" :key="p.id" class="calendar-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>{{ p.title }}</span>
            <span class="badge" :class="statusClass(p.status)">{{ p.status }}</span>
          </div>
          <div class="small text-muted">
            {{ formatDate(p.startDate) }} → {{ formatDate(p.endDate) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="editId && canManageProjects" class="card-plain mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Edit Project</strong>
        <button class="btn btn-sm btn-outline-secondary" @click="cancelEdit">Cancel</button>
      </div>
      <form @submit.prevent="saveEdit">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted">Title</label>
            <input v-model="editForm.title" class="form-control" placeholder="Title" required />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Manager</label>
            <select v-model="editForm.manager_id" class="form-select">
              <option disabled value="">Select manager</option>
              <option v-for="m in managers" :key="m.id" :value="m.id">
                {{ m.name }} ({{ m.email }})
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Status</label>
            <select v-model="editForm.status" class="form-select">
              <option value="todo">todo</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
              <option value="on_hold">on_hold</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Priority</label>
            <input v-model="editForm.priority" type="number" min="0" class="form-control" placeholder="Priority" />
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-3">
            <label class="form-label small text-muted">Start date</label>
            <input v-model="editForm.start_date" type="date" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">End date</label>
            <input v-model="editForm.end_date" type="date" class="form-control" />
          </div>
          <div v-if="canAllocateBudget" class="col-md-3">
            <label class="form-label small text-muted">Budget (USD)</label>
            <input v-model="editForm.budget" type="number" min="0" class="form-control" placeholder="Budget (USD)" />
          </div>
        </div>
        <div class="mt-2">
          <label class="form-label small text-muted">Description</label>
          <textarea v-model="editForm.description" class="form-control" placeholder="Description"></textarea>
        </div>
        <button class="btn btn-outline-secondary mt-2">Save changes</button>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const projects = ref([]);
const managers = ref([]);
const resourceItems = ref([]);
const resourceSelections = reactive({});
const error = ref("");
const showForm = ref(false);
const editId = ref(0);
const filters = reactive({ q: "", status: "" });
const viewMode = ref("table");
const auth = useAuthStore();
const statuses = ["todo", "pending", "in_progress", "done", "on_hold"];
const statusLabels = {
  todo: "Todo",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold"
};
const form = reactive({
  title: "",
  description: "",
  manager_id: "",
  status: "pending",
  priority: 0,
  budget: 0,
  start_date: "",
  end_date: ""
});
const editForm = reactive({
  title: "",
  description: "",
  manager_id: "",
  status: "pending",
  priority: 0,
  budget: 0,
  start_date: "",
  end_date: ""
});
const formatDate = (value) => (value ? String(value).slice(0, 10) : "-");
const statusClass = (status) =>
  ({
    todo: "bg-secondary",
    pending: "bg-warning text-dark",
    in_progress: "bg-primary",
    done: "bg-success",
    on_hold: "bg-dark"
  }[status] || "bg-secondary");
const canUpdateStatus = computed(() => !!auth.user);
const canManageProjects = computed(
  () => auth.user?.role === "admin" || auth.user?.role === "manager"
);
const canAllocateBudget = computed(() => auth.user?.role === "manager");
const projectsByStatus = computed(() =>
  statuses.reduce((acc, status) => {
    acc[status] = projects.value.filter((p) => p.status === status);
    return acc;
  }, {})
);
const projectCalendar = computed(() => {
  const buckets = {};
  projects.value.forEach((p) => {
    const key = p.startDate || p.endDate || "no-date";
    const label =
      key === "no-date"
        ? "No date"
        : new Date(key).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
    if (!buckets[key]) buckets[key] = { dateKey: key, label, items: [] };
    buckets[key].items.push(p);
  });
  return Object.values(buckets).sort((a, b) => {
    if (a.dateKey === "no-date") return 1;
    if (b.dateKey === "no-date") return -1;
    return new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime();
  });
});

const load = async () => {
  try {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.status) params.status = filters.status;
    const { data } = await api.get("/api/projects", { params });
    projects.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load projects";
  }
};

const loadManagers = async () => {
  try {
    const { data } = await api.get("/api/users/managers");
    managers.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load managers";
  }
};

const loadResourceCatalog = async () => {
  try {
    const { data } = await api.get("/api/resources/catalog");
    resourceItems.value = data;
    data.forEach((item) => {
      if (!resourceSelections[item.id]) {
        resourceSelections[item.id] = { selected: false, amount: 1 };
      }
    });
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load resources";
  }
};

const createProject = async () => {
  error.value = "";
  try {
    const resources = Object.entries(resourceSelections)
      .filter(([, v]) => v.selected && Number(v.amount) > 0)
      .map(([id, v]) => ({
        resourceItemId: Number(id),
        amount: Number(v.amount)
      }));

    await api.post("/api/projects", {
      title: form.title,
      description: form.description,
      manager_id: Number(form.manager_id),
      status: form.status,
      priority: Number(form.priority),
      budget: canAllocateBudget.value ? Number(form.budget) : 0,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      resources
    });
    form.title = "";
    form.description = "";
    form.manager_id = "";
    form.priority = 0;
    form.budget = 0;
    form.start_date = "";
    form.end_date = "";
    showForm.value = false;
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to create project";
  }
};

const startEdit = (project) => {
  editId.value = project.id;
  editForm.title = project.title || "";
  editForm.description = project.description || "";
  editForm.manager_id = project.managerId ? String(project.managerId) : "";
  editForm.status = project.status || "pending";
  editForm.priority = project.priority ?? 0;
  editForm.budget = project.budget ?? 0;
  editForm.start_date = formatDate(project.startDate) !== "-" ? formatDate(project.startDate) : "";
  editForm.end_date = formatDate(project.endDate) !== "-" ? formatDate(project.endDate) : "";
};

const cancelEdit = () => {
  editId.value = 0;
};

const saveEdit = async () => {
  if (!editId.value) return;
  error.value = "";
  try {
    await api.put(`/api/projects/${editId.value}`, {
      title: editForm.title,
      description: editForm.description,
      manager_id: editForm.manager_id ? Number(editForm.manager_id) : undefined,
      status: editForm.status,
      priority: Number(editForm.priority),
      ...(canAllocateBudget.value ? { budget: Number(editForm.budget) } : {}),
      start_date: editForm.start_date || undefined,
      end_date: editForm.end_date || undefined
    });
    editId.value = 0;
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update project";
  }
};

const updateStatus = async (projectId, event) => {
  error.value = "";
  try {
    const status = event.target.value;
    await api.patch(`/api/projects/${projectId}/status`, { status });
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update project status";
  }
};

const resetFilters = () => {
  filters.q = "";
  filters.status = "";
  load();
};

onMounted(async () => {
  await load();
  await loadManagers();
  await loadResourceCatalog();
});
</script>
