<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Project Details</h2>
        <div class="text-muted small">Notion-style page</div>
      </div>
      <router-link class="btn btn-outline-secondary" to="/projects">Back</router-link>
    </div>

    <div v-if="project" class="card-plain mb-3">
      <div><strong>Title:</strong> {{ project.title }}</div>
      <div><strong>Status:</strong> {{ project.status }}</div>
      <div><strong>Priority:</strong> {{ project.priority }}</div>
      <div><strong>Manager:</strong> {{ managerDisplay }}</div>
      <div><strong>Budget:</strong> {{ project.budget }}</div>
      <div><strong>Spent:</strong> {{ project.spent }}</div>
      <div><strong>Start date:</strong> {{ formatDate(project.startDate) }}</div>
      <div><strong>End date:</strong> {{ formatDate(project.endDate) }}</div>
      <div class="mt-2">{{ project.description }}</div>
    </div>

    <div class="d-flex gap-2">
      <router-link class="btn btn-outline-secondary" :to="`/projects/${id}/tasks`">Tasks</router-link>
      <router-link class="btn btn-outline-secondary" :to="`/projects/${id}/resources`">Resources</router-link>
    </div>

    <div class="card-plain mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Project Members</strong>
      </div>
      <div v-if="canManageMembers" class="row g-2 mb-2">
        <div class="col-md-6">
          <select v-model="selectedUser" class="form-select">
            <option disabled value="">Select user to add</option>
            <option v-for="u in users" :key="u.id" :value="u.id">
              {{ u.name }} ({{ u.email }})
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-secondary" @click="addMember">Add Member</button>
        </div>
      </div>

      <div v-if="members.length === 0" class="text-muted small">No members yet.</div>
      <ul class="list-unstyled mb-0">
        <li v-for="m in members" :key="m.id">
          {{ m.name }} ({{ m.email }})
        </li>
      </ul>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>
    <div class="card-plain mt-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Project Files</strong>
      </div>
      <form v-if="canManageFiles" @submit.prevent="uploadFile" class="row g-2 align-items-end">
        <div class="col-md-4">
          <input ref="fileInput" type="file" class="form-control" required />
        </div>
        <div class="col-md-4">
          <select v-model="selectedTask" class="form-select">
            <option value="">Attach to task (optional)</option>
            <option v-for="t in tasks" :key="t.id" :value="t.id">{{ t.title }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100">Upload</button>
        </div>
      </form>
      <div v-if="files.length === 0" class="text-muted small mt-2">No files yet.</div>
      <table v-else class="table-lite mt-2">
        <thead>
          <tr>
            <th>Name</th>
            <th>Uploaded by</th>
            <th>Task</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in files" :key="f.id">
            <td>{{ f.originalName }}</td>
            <td>{{ f.uploader?.name || "-" }}</td>
            <td>{{ f.task?.title || "-" }}</td>
            <td class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" @click="downloadFile(f)">
                Download
              </button>
              <button
                v-if="canManageFiles"
                class="btn btn-sm btn-outline-danger"
                @click="deleteFile(f.id)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>
    <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const id = route.params.id;
const project = ref(null);
const error = ref("");
const users = ref([]);
const members = ref([]);
const files = ref([]);
const tasks = ref([]);
const selectedUser = ref("");
const selectedTask = ref("");
const fileInput = ref(null);
const auth = useAuthStore();
const managerDisplay = computed(() => {
  if (!project.value) return "-";
  const manager = users.value.find((u) => u.id === project.value.managerId);
  if (manager) return `${manager.name} (${manager.email})`;
  return project.value.managerId ?? "-";
});
const canManageFiles = computed(() => {
  const user = auth.user;
  if (!user || !project.value) return false;
  return user.role === "admin" || project.value.managerId === user.id;
});
const canManageMembers = computed(() => canManageFiles.value);
const formatDate = (value) => (value ? String(value).slice(0, 10) : "-");

onMounted(async () => {
  try {
    const { data } = await api.get(`/api/projects/${id}`);
    project.value = data;
    await loadUsers();
    await loadMembers();
    await loadFiles();
    await loadTasks();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load project";
  }
});

const loadUsers = async () => {
  if (!canManageMembers.value) return;
  try {
    const { data } = await api.get("/api/users/assignable");
    users.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load users";
  }
};

const loadMembers = async () => {
  try {
    const { data } = await api.get(`/api/projects/${id}/members`);
    members.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load members";
  }
};

const addMember = async () => {
  if (!selectedUser.value) return;
  try {
    await api.post(`/api/projects/${id}/members`, { userId: Number(selectedUser.value) });
    selectedUser.value = "";
    await loadMembers();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to add member";
  }
};

const loadFiles = async () => {
  try {
    const { data } = await api.get(`/api/projects/${id}/files`);
    files.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load files";
  }
};

const loadTasks = async () => {
  if (!canManageFiles.value) return;
  try {
    const { data } = await api.get(`/api/projects/${id}/tasks`);
    tasks.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load tasks";
  }
};

const uploadFile = async () => {
  error.value = "";
  if (!fileInput.value?.files?.length) return;
  const formData = new FormData();
  formData.append("file", fileInput.value.files[0]);
  formData.append("projectId", id);
  if (selectedTask.value) {
    formData.append("taskId", selectedTask.value);
  }
  try {
    await api.post("/api/files", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    fileInput.value.value = "";
    selectedTask.value = "";
    await loadFiles();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to upload file";
  }
};

const downloadFile = async (file) => {
  try {
    const response = await api.get(`/api/files/${file.id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = file.originalName || `file-${file.id}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to download file";
  }
};

const deleteFile = async (fileId) => {
  error.value = "";
  try {
    await api.delete(`/api/files/${fileId}`);
    await loadFiles();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to delete file";
  }
};
</script>
