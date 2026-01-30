<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Notifications & Messages</h2>
        <div class="text-muted small">Inbox</div>
      </div>
    </div>
    <div v-if="canSend" class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Send Message</strong>
      </div>
      <form @submit.prevent="sendMessage">
        <div class="row g-2">
          <div class="col-md-4">
            <select v-model="messageForm.user_id" class="form-select" required>
              <option disabled value="">Select user</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <input v-model="messageForm.title" class="form-control" placeholder="Title" required />
          </div>
          <div class="col-md-4">
            <input v-model="messageForm.body" class="form-control" placeholder="Message" required />
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Send</button>
      </form>
    </div>
    <div v-if="error" class="text-danger small mb-2">{{ error }}</div>
    <table class="table-lite">
      <thead>
        <tr>
          <th>Title</th>
          <th>Message</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in notifications" :key="n.id">
          <td>{{ n.title }}</td>
          <td>{{ n.body }}</td>
          <td>
            <span v-if="n.readAt">Read</span>
            <button v-else class="btn btn-sm btn-outline-primary" @click="markRead(n.id)">
              Mark as read
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const notifications = ref([]);
const users = ref([]);
const error = ref("");
const auth = useAuthStore();
const messageForm = reactive({ user_id: "", title: "", body: "" });
const canSend = computed(() => auth.user?.role === "admin" || auth.user?.role === "manager");

const load = async () => {
  try {
    const { data } = await api.get("/api/notifications");
    notifications.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load notifications";
  }
};

const loadUsers = async () => {
  if (!canSend.value) return;
  try {
    const { data } = await api.get("/api/users/assignable");
    users.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load users";
  }
};

const markRead = async (id) => {
  error.value = "";
  try {
    await api.patch(`/api/notifications/${id}/read`);
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to update notification";
  }
};

const sendMessage = async () => {
  error.value = "";
  try {
    await api.post("/api/notifications", {
      user_id: Number(messageForm.user_id),
      title: messageForm.title,
      body: messageForm.body
    });
    messageForm.user_id = "";
    messageForm.title = "";
    messageForm.body = "";
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to send message";
  }
};

onMounted(async () => {
  await load();
  await loadUsers();
});
</script>
