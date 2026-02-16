<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Admin - Users</h2>
        <div class="text-muted small">Manage users and roles</div>
      </div>
      <button class="btn btn-outline-secondary" @click="load">Refresh</button>
    </div>

    <div v-if="!canView" class="alert alert-warning">
      You do not have access to this page.
    </div>

    <div v-else>
      <div class="card-plain mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>Create user</strong>
        </div>
      <form @submit.prevent="createUser">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted">Name</label>
            <input v-model="form.name" class="form-control" placeholder="Name" required />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Email</label>
            <input v-model="form.email" type="email" class="form-control" placeholder="Email" required />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="Password"
                minlength="6"
                required
              />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">Role</label>
            <select v-model="form.role" class="form-select">
              <option value="member">Team member</option>
              <option value="manager">Project manager</option>
              <option value="admin">Admin</option>
            </select>
            </div>
          </div>
          <button class="btn btn-outline-secondary mt-2">Create user</button>
        </form>
        <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
      </div>

      <div class="card-plain mb-3" v-if="editId">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>Edit user</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="cancelEdit">Cancel</button>
        </div>
        <form @submit.prevent="saveEdit">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label small text-muted">Name</label>
              <input v-model="editForm.name" class="form-control" placeholder="Name" required />
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Email</label>
              <input v-model="editForm.email" type="email" class="form-control" placeholder="Email" required />
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Password</label>
              <input
                v-model="editForm.password"
                type="password"
                class="form-control"
                placeholder="New password (optional)"
                minlength="6"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Role</label>
              <select v-model="editForm.role" class="form-select">
                <option value="member">Team member</option>
                <option value="manager">Project manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button class="btn btn-outline-secondary mt-2">Save changes</button>
        </form>
      </div>

      <div class="card-plain">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>Users</strong>
          <span class="text-muted small" v-if="loading">Loading...</span>
        </div>
        <table class="table-lite">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" @click="startEdit(u)">Edit</button>
                <button class="btn btn-sm btn-outline-danger" @click="removeUser(u.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const users = ref([]);
const loading = ref(false);
const error = ref("");
const editId = ref(0);

const form = reactive({ name: "", email: "", password: "", role: "member" });
const editForm = reactive({ name: "", email: "", password: "", role: "member" });

const canView = computed(() => auth.user?.role === "admin");

const load = async () => {
  if (!canView.value) return;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/api/users");
    users.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load users";
  } finally {
    loading.value = false;
  }
};

const createUser = async () => {
  error.value = "";
  try {
    await api.post("/api/users", {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    });
    form.name = "";
    form.email = "";
    form.password = "";
    form.role = "member";
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to create user";
  }
};

const startEdit = (user) => {
  editId.value = user.id;
  editForm.name = user.name || "";
  editForm.email = user.email || "";
  editForm.password = "";
  editForm.role = user.role || "member";
};

const cancelEdit = () => {
  editId.value = 0;
};

const saveEdit = async () => {
  if (!editId.value) return;
  error.value = "";
  try {
    const payload = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role
    };
    if (editForm.password) payload.password = editForm.password;
    await api.put(`/api/users/${editId.value}`, payload);
    editId.value = 0;
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update user";
  }
};

const removeUser = async (id) => {
  error.value = "";
  try {
    await api.delete(`/api/users/${id}`);
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to delete user";
  }
};

onMounted(async () => {
  await load();
});
</script>
