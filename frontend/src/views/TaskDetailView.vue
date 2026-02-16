<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Task Details</h2>
        <div class="text-muted small">Task {{ id }}</div>
      </div>
      <div class="d-flex gap-2">
        <router-link v-if="project" class="btn btn-outline-secondary" :to="`/projects/${project.id}/tasks`">
          Back to tasks
        </router-link>
        <router-link v-else class="btn btn-outline-secondary" to="/projects">Back</router-link>
        <router-link
          v-if="canManage"
          class="btn btn-outline-primary"
          :to="`/tasks/${id}/edit`"
        >
          Edit
        </router-link>
      </div>
    </div>

    <div v-if="error" class="text-danger small mb-2">{{ error }}</div>

    <div v-if="!task" class="text-muted small">Loading task...</div>

    <div v-else class="card-plain mb-3">
      <div><strong>Title:</strong> {{ task.title }}</div>
      <div><strong>Status:</strong> {{ task.status }}</div>
      <div><strong>Assignee:</strong> {{ assigneeLabel }}</div>
      <div><strong>Due date:</strong> {{ formatDate(task.dueDate) }}</div>
      <div><strong>Cost:</strong> {{ task.cost || 0 }}</div>
      <div><strong>Project:</strong> {{ project?.title || task.projectId }}</div>
      <div class="mt-2" v-if="task.description">{{ task.description }}</div>
    </div>

    <div v-if="isEdit && task" class="card-plain">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Edit Task</strong>
        <router-link class="btn btn-sm btn-outline-secondary" :to="`/tasks/${id}`">Cancel</router-link>
      </div>
      <form @submit.prevent="save">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted">Title</label>
            <input v-model="form.title" class="form-control" placeholder="Title" required />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Assignee</label>
            <select v-model="form.assignee_id" class="form-select">
              <option disabled value="">Select assignee</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted">Due date</label>
            <input v-model="form.due_date" type="date" class="form-control" />
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted">Cost (USD)</label>
            <input v-model="form.cost" type="number" min="0" class="form-control" placeholder="Cost (USD)" />
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted">Status</label>
            <select v-model="form.status" class="form-select">
              <option value="todo">todo</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
              <option value="on_hold">on_hold</option>
            </select>
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Save changes</button>
      </form>
    </div>

    <div v-if="canEditStatus && task" class="card-plain mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Quick status</strong>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="setStatus('pending')">Pending</button>
        <button class="btn btn-outline-primary" @click="setStatus('in_progress')">In progress</button>
        <button class="btn btn-outline-success" @click="setStatus('done')">Done</button>
        <button class="btn btn-outline-dark" @click="setStatus('on_hold')">On hold</button>
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
const id = String(route.params.id);
const task = ref(null);
const project = ref(null);
const users = ref([]);
const error = ref("");
const auth = useAuthStore();

const isEdit = computed(() => String(route.path).endsWith("/edit"));
const canManage = computed(() => auth.user?.role === "admin" || auth.user?.role === "manager");
const canEditStatus = computed(() => {
  const user = auth.user;
  if (!user || !task.value) return false;
  return user.role === "admin" || user.role === "manager" || task.value.assigneeId === user.id;
});

const form = reactive({
  title: "",
  assignee_id: "",
  due_date: "",
  cost: 0,
  status: "pending"
});

const formatDate = (value) => (value ? String(value).slice(0, 10) : "-");
const assigneeLabel = computed(() => {
  if (!task.value) return "-";
  if (task.value.assignee) {
    return `${task.value.assignee.name} (${task.value.assignee.email})`;
  }
  return task.value.assigneeId ?? "-";
});

const load = async () => {
  error.value = "";
  try {
    const { data } = await api.get(`/api/tasks/${id}`);
    task.value = data;
    form.title = data.title || "";
    form.assignee_id = data.assigneeId ? String(data.assigneeId) : "";
    form.due_date = formatDate(data.dueDate) !== "-" ? formatDate(data.dueDate) : "";
    form.cost = data.cost ?? 0;
    form.status = data.status || "pending";
    const projectRes = await api.get(`/api/projects/${data.projectId}`);
    project.value = projectRes.data;
    if (canManage.value) {
      const usersRes = await api.get("/api/users/assignable");
      users.value = usersRes.data;
    }
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load task";
  }
};

const save = async () => {
  error.value = "";
  try {
    await api.put(`/api/tasks/${id}`, {
      title: form.title,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : undefined,
      due_date: form.due_date || undefined,
      cost: Number(form.cost),
      status: form.status
    });
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update task";
  }
};

const setStatus = async (status) => {
  error.value = "";
  try {
    await api.patch(`/api/tasks/${id}/status`, { status });
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update status";
  }
};

onMounted(async () => {
  await load();
});
</script>
