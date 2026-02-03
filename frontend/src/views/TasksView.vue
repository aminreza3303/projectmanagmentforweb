<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Project {{ id }} Tasks</h2>
        <div class="text-muted small">Database view</div>
      </div>
      <router-link class="btn btn-outline-secondary" :to="`/projects/${id}`">Back</router-link>
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
        <div v-if="canManageTasks" class="col-md-3">
          <label class="form-label small text-muted">Assignee</label>
          <select v-model="filters.assigneeId" class="form-select">
            <option value="">All</option>
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.email }})
            </option>
          </select>
        </div>
        <div class="col-md-2 d-flex gap-2">
          <button class="btn btn-outline-secondary" @click="load">Apply</button>
          <button class="btn btn-outline-secondary" @click="resetFilters">Clear</button>
        </div>
      </div>
    </div>

    <div v-if="canManageTasks" class="card-plain mb-3">
      <form @submit.prevent="createTask">
        <div class="row g-2">
          <div class="col-md-3">
            <input v-model="form.title" class="form-control" placeholder="Title" required />
          </div>
          <div class="col-md-3">
            <select v-model="form.assignee_id" class="form-select" required>
              <option disabled value="">Select assignee</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <input v-model="form.due_date" type="date" class="form-control" required />
          </div>
          <div class="col-md-2">
            <input v-model="form.cost" type="number" min="0" class="form-control" placeholder="Cost" />
          </div>
          <div class="col-md-2">
            <select v-model="form.status" class="form-select">
              <option value="todo">todo</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
              <option value="on_hold">on_hold</option>
            </select>
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Create task</button>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <div v-if="viewMode === 'table'">
      <table class="table-lite">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Due date</th>
            <th>Cost</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tasks" :key="t.id">
            <td>
              <div v-if="editId === t.id">
                <input v-model="editForm.title" class="form-control form-control-sm" />
              </div>
              <div v-else>{{ t.title }}</div>
            </td>
            <td>
              <div v-if="editId === t.id">
                <select v-model="editForm.status" class="form-select form-select-sm">
                  <option value="todo">todo</option>
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                  <option value="on_hold">on_hold</option>
                </select>
              </div>
              <div v-else-if="canEditStatus(t)">
                <select class="form-select form-select-sm" :value="t.status" @change="updateStatus(t.id, $event)">
                  <option value="todo">todo</option>
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                  <option value="on_hold">on_hold</option>
                </select>
                <span class="badge ms-2" :class="statusClass(t.status)">{{ t.status }}</span>
              </div>
              <div v-else>
                <span class="badge" :class="statusClass(t.status)">{{ t.status }}</span>
              </div>
            </td>
            <td>
              <div v-if="editId === t.id">
                <select v-model="editForm.assignee_id" class="form-select form-select-sm">
                  <option disabled value="">Select assignee</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">
                    {{ u.name }} ({{ u.email }})
                  </option>
                </select>
              </div>
              <div v-else>{{ assigneeLabel(t) }}</div>
            </td>
            <td>
              <div v-if="editId === t.id">
                <input v-model="editForm.due_date" type="date" class="form-control form-control-sm" />
              </div>
              <div v-else>{{ formatDate(t.dueDate) }}</div>
            </td>
            <td>
              <div v-if="editId === t.id">
                <input v-model="editForm.cost" type="number" min="0" class="form-control form-control-sm" />
              </div>
              <div v-else>{{ t.cost || 0 }}</div>
            </td>
            <td>
              <div v-if="editId === t.id" class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" @click.prevent="saveEdit">Save</button>
                <button class="btn btn-sm btn-outline-secondary" @click.prevent="cancelEdit">Cancel</button>
              </div>
              <div v-else class="d-flex gap-2">
                <button
                  v-if="canManageTasks"
                  class="btn btn-sm btn-outline-secondary"
                  @click="startEdit(t)"
                >
                  Edit
                </button>
                <button
                  v-if="canEditStatus(t)"
                  class="btn btn-sm btn-outline-success"
                  @click="markDone(t.id)"
                >
                  Mark done
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="viewMode === 'board'" class="board-grid">
      <div v-for="status in statuses" :key="status" class="board-column">
        <div class="board-column-title">
          {{ statusLabels[status] }} ({{ tasksByStatus[status].length }})
        </div>
        <div v-if="tasksByStatus[status].length === 0" class="text-muted small">Empty</div>
        <div v-for="t in tasksByStatus[status]" :key="t.id" class="board-card card-plain">
          <div class="fw-semibold">{{ t.title }}</div>
          <div class="small text-muted">Assignee: {{ assigneeLabel(t) }}</div>
          <div class="small text-muted">Due: {{ formatDate(t.dueDate) }}</div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="badge" :class="statusClass(t.status)">{{ t.status }}</span>
            <button
              v-if="canEditStatus(t)"
              class="btn btn-sm btn-outline-secondary"
              @click="updateStatusDirect(t.id, nextStatus(t.status))"
            >
              Move
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'calendar'" class="calendar-grid">
      <div v-if="taskCalendar.length === 0" class="text-muted small">No dated tasks.</div>
      <div v-for="bucket in taskCalendar" :key="bucket.dateKey" class="card-plain calendar-card">
        <div class="fw-semibold mb-1">{{ bucket.label }}</div>
        <div v-for="t in bucket.items" :key="t.id" class="calendar-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>{{ t.title }}</span>
            <span class="badge" :class="statusClass(t.status)">{{ t.status }}</span>
          </div>
          <div class="small text-muted">Assignee: {{ assigneeLabel(t) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const id = route.params.id;
const tasks = ref([]);
const users = ref([]);
const error = ref("");
const auth = useAuthStore();
const editId = ref(0);
const viewMode = ref("table");
const statuses = ["todo", "pending", "in_progress", "done", "on_hold"];
const statusLabels = {
  todo: "Todo",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold"
};
const filters = reactive({ q: "", status: "", assigneeId: "" });
const form = reactive({ title: "", assignee_id: "", due_date: "", cost: 0, status: "pending" });
const editForm = reactive({
  title: "",
  assignee_id: "",
  due_date: "",
  cost: 0,
  status: "pending"
});
const assigneeLabel = (task) => {
  if (task.assignee) {
    return `${task.assignee.name} (${task.assignee.email})`;
  }
  const user = users.value.find((u) => u.id === task.assigneeId);
  if (user) return `${user.name} (${user.email})`;
  return task.assigneeId ?? "-";
};
const formatDate = (value) => (value ? String(value).slice(0, 10) : "-");
const statusClass = (status) =>
  ({
    todo: "bg-secondary",
    pending: "bg-warning text-dark",
    in_progress: "bg-primary",
    done: "bg-success",
    on_hold: "bg-dark"
  }[status] || "bg-secondary");
const canManageTasks = computed(() => auth.user?.role === "admin" || auth.user?.role === "manager");
const canEditStatus = (task) => {
  const user = auth.user;
  if (!user) return false;
  return user.role === "admin" || user.role === "manager" || task.assigneeId === user.id;
};
const tasksByStatus = computed(() =>
  statuses.reduce((acc, status) => {
    acc[status] = tasks.value.filter((t) => t.status === status);
    return acc;
  }, {})
);
const taskCalendar = computed(() => {
  const buckets = {};
  tasks.value.forEach((t) => {
    const key = t.dueDate || "no-date";
    const label =
      key === "no-date"
        ? "No due date"
        : new Date(key).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
    if (!buckets[key]) buckets[key] = { dateKey: key, label, items: [] };
    buckets[key].items.push(t);
  });
  return Object.values(buckets).sort((a, b) => {
    if (a.dateKey === "no-date") return 1;
    if (b.dateKey === "no-date") return -1;
    return new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime();
  });
});
const nextStatus = (status) => {
  const order = ["todo", "pending", "in_progress", "done", "on_hold"];
  const idx = order.indexOf(status);
  return order[(idx + 1) % order.length];
};

const load = async () => {
  try {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.status) params.status = filters.status;
    if (filters.assigneeId) params.assigneeId = filters.assigneeId;
    const { data } = await api.get(`/api/projects/${id}/tasks`, { params });
    tasks.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load tasks";
  }
};

const loadUsers = async () => {
  if (!canManageTasks.value) return;
  try {
    const { data } = await api.get(`/api/users/assignable`);
    users.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load users";
  }
};

const createTask = async () => {
  error.value = "";
  try {
    await api.post(`/api/projects/${id}/tasks`, {
      title: form.title,
      assignee_id: Number(form.assignee_id),
      due_date: form.due_date,
      cost: Number(form.cost),
      status: form.status
    });
    form.title = "";
    form.assignee_id = "";
    form.due_date = "";
    form.cost = 0;
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to create task";
  }
};

const markDone = async (taskId) => {
  error.value = "";
  try {
    await api.patch(`/api/tasks/${taskId}/status`, { status: "done" });
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update status";
  }
};

const updateStatus = async (taskId, event) => {
  error.value = "";
  try {
    const status = event.target.value;
    await api.patch(`/api/tasks/${taskId}/status`, { status });
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update status";
  }
};

const updateStatusDirect = async (taskId, status) => {
  error.value = "";
  try {
    await api.patch(`/api/tasks/${taskId}/status`, { status });
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update status";
  }
};

const startEdit = (task) => {
  editId.value = task.id;
  editForm.title = task.title || "";
  editForm.assignee_id = task.assigneeId ? String(task.assigneeId) : "";
  editForm.due_date = formatDate(task.dueDate) !== "-" ? formatDate(task.dueDate) : "";
  editForm.cost = task.cost ?? 0;
  editForm.status = task.status || "pending";
};

const cancelEdit = () => {
  editId.value = 0;
};

const saveEdit = async () => {
  if (!editId.value) return;
  error.value = "";
  try {
    await api.put(`/api/tasks/${editId.value}`, {
      title: editForm.title,
      assignee_id: editForm.assignee_id ? Number(editForm.assignee_id) : undefined,
      due_date: editForm.due_date || undefined,
      cost: Number(editForm.cost),
      status: editForm.status
    });
    editId.value = 0;
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update task";
  }
};

const resetFilters = () => {
  filters.q = "";
  filters.status = "";
  filters.assigneeId = "";
  load();
};

onMounted(async () => {
  await load();
  await loadUsers();
});
</script>
