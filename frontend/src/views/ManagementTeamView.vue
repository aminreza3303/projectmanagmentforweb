<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Management Team</h2>
        <div class="text-muted small">Manage project members by project</div>
      </div>
      <button class="btn btn-outline-secondary" @click="loadAll">Refresh</button>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Projects</strong>
        <span class="text-muted small">{{ projects.length }} project(s)</span>
      </div>
      <div v-if="loadingProjects" class="text-muted small">Loading projects...</div>
      <table v-else class="table-lite">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Manager</th>
            <th>Members</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>{{ project.title }}</td>
            <td>{{ project.status }}</td>
            <td>{{ managerLabel(project) }}</td>
            <td>{{ memberCounts[project.id] ?? "-" }}</td>
            <td>
              <button
                class="btn btn-sm btn-outline-primary"
                :class="{ active: Number(selectedProjectId) === project.id }"
                @click="selectProject(project.id)"
              >
                Manage
              </button>
            </td>
          </tr>
          <tr v-if="projects.length === 0">
            <td colspan="5" class="text-muted small">No projects available.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedProject" class="card-plain">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>{{ selectedProject.title }} - Members</strong>
        <span class="text-muted small">Manager: {{ managerLabel(selectedProject) }}</span>
      </div>

      <div v-if="canManageSelectedProject && canManageMembers" class="row g-2 align-items-end mb-3">
        <div class="col-md-6">
          <label class="form-label small text-muted">Add member</label>
          <select v-model="selectedUserId" class="form-select">
            <option value="" disabled>Select user</option>
            <option v-for="user in availableUsers" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }}) - {{ user.role }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-secondary w-100" @click="addMember">Add to project</button>
        </div>
      </div>

      <div v-if="loadingMembers" class="text-muted small">Loading members...</div>
      <table v-else class="table-lite">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th v-if="canManageSelectedProject"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td>{{ member.name }}</td>
            <td>{{ member.email }}</td>
            <td>{{ member.role }}</td>
            <td v-if="canManageSelectedProject">
              <button class="btn btn-sm btn-outline-danger" @click="removeMember(member)">
                Remove
              </button>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td :colspan="canManageSelectedProject ? 4 : 3" class="text-muted small">
              No members assigned yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const projects = ref([]);
const members = ref([]);
const assignableUsers = ref([]);
const selectedProjectId = ref("");
const selectedUserId = ref("");
const loadingProjects = ref(false);
const loadingMembers = ref(false);
const error = ref("");
const memberCounts = reactive({});

const canManageMembers = computed(
  () => auth.user?.role === "admin" || auth.user?.role === "manager"
);

const selectedProject = computed(() =>
  projects.value.find((project) => project.id === Number(selectedProjectId.value)) || null
);

const canManageSelectedProject = computed(() => {
  const project = selectedProject.value;
  const user = auth.user;
  if (!project || !user) return false;
  return user.role === "admin" || project.managerId === user.id;
});

const userMap = computed(
  () => new Map(assignableUsers.value.map((user) => [user.id, user]))
);

const managerLabel = (project) => {
  const manager = userMap.value.get(project.managerId);
  if (!manager) return `ID: ${project.managerId}`;
  return `${manager.name} (${manager.email})`;
};

const availableUsers = computed(() => {
  const project = selectedProject.value;
  if (!project) return [];
  const used = new Set(members.value.map((member) => member.id));
  used.add(project.managerId);
  return assignableUsers.value.filter((user) => !used.has(user.id));
});

const loadAssignableUsers = async () => {
  if (!canManageMembers.value) return;
  const { data } = await api.get("/api/users/assignable");
  assignableUsers.value = data;
};

const loadProjects = async () => {
  loadingProjects.value = true;
  const { data } = await api.get("/api/projects");
  projects.value = data;
  if (!selectedProjectId.value && projects.value.length > 0) {
    selectedProjectId.value = String(projects.value[0].id);
  }
  loadingProjects.value = false;
};

const loadProjectMembers = async (projectId) => {
  loadingMembers.value = true;
  const { data } = await api.get(`/api/projects/${projectId}/members`);
  members.value = data;
  memberCounts[projectId] = data.length;
  loadingMembers.value = false;
};

const loadMemberCounts = async () => {
  const tasks = projects.value.map(async (project) => {
    try {
      const { data } = await api.get(`/api/projects/${project.id}/members`);
      memberCounts[project.id] = data.length;
    } catch {
      memberCounts[project.id] = 0;
    }
  });
  await Promise.all(tasks);
};

const selectProject = async (projectId) => {
  selectedProjectId.value = String(projectId);
  selectedUserId.value = "";
  error.value = "";
  await loadProjectMembers(projectId);
};

const addMember = async () => {
  error.value = "";
  if (!selectedProject.value || !selectedUserId.value) return;
  try {
    await api.post(`/api/projects/${selectedProject.value.id}/members`, {
      userId: Number(selectedUserId.value)
    });
    selectedUserId.value = "";
    await loadProjectMembers(selectedProject.value.id);
    memberCounts[selectedProject.value.id] = members.value.length;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to add member";
  }
};

const removeMember = async (member) => {
  error.value = "";
  if (!selectedProject.value) return;
  if (!window.confirm(`Remove ${member.name} from this project?`)) return;
  try {
    await api.delete(`/api/projects/${selectedProject.value.id}/members/${member.id}`);
    await loadProjectMembers(selectedProject.value.id);
    memberCounts[selectedProject.value.id] = members.value.length;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to remove member";
  }
};

const loadAll = async () => {
  error.value = "";
  try {
    await Promise.all([loadProjects(), loadAssignableUsers()]);
    await loadMemberCounts();
    if (selectedProjectId.value) {
      await loadProjectMembers(Number(selectedProjectId.value));
    }
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load management data";
    loadingProjects.value = false;
    loadingMembers.value = false;
  }
};

onMounted(async () => {
  await loadAll();
});
</script>
