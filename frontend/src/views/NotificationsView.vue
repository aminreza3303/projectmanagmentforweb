<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Notifications & Messages</h2>
        <div class="text-muted small">Inbox</div>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-sm"
          :class="filter === 'all' ? 'btn-outline-primary' : 'btn-outline-secondary'"
          @click="filter = 'all'"
        >
          All
        </button>
        <button
          class="btn btn-sm"
          :class="filter === 'unread' ? 'btn-outline-primary' : 'btn-outline-secondary'"
          @click="filter = 'unread'"
        >
          Unread
        </button>
      </div>
    </div>
    <div v-if="canSend" class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>Send Message</strong>
      </div>
      <form @submit.prevent="sendMessage">
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label small text-muted">User</label>
            <select v-model="messageForm.user_id" class="form-select" required>
              <option disabled value="">Select user</option>
              <option v-for="u in users" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small text-muted">Title</label>
            <input
              v-model="messageForm.title"
              class="form-control"
              placeholder="Title"
              minlength="2"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label small text-muted">Message</label>
            <input
              v-model="messageForm.body"
              class="form-control"
              placeholder="Message"
              minlength="2"
              required
            />
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">Send</button>
      </form>
    </div>
    <div v-if="loading" class="text-muted small mb-2">Loading notifications...</div>
    <div v-if="error" class="text-danger small mb-2">{{ error }}</div>
    <div v-if="filteredNotifications.length === 0" class="text-muted small mb-2">
      No notifications to show.
    </div>
    <table class="table-lite">
      <thead>
        <tr>
          <th>Title</th>
          <th>Message</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in filteredNotifications" :key="n.id">
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
const loading = ref(false);
const filter = ref("all");
const auth = useAuthStore();
const messageForm = reactive({ user_id: "", title: "", body: "" });
const canSend = computed(() => auth.user?.role === "admin" || auth.user?.role === "manager");
const filteredNotifications = computed(() =>
  filter.value === "unread" ? notifications.value.filter((n) => !n.readAt) : notifications.value
);

const load = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/api/notifications");
    notifications.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load notifications";
  } finally {
    loading.value = false;
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
  const title = messageForm.title.trim();
  const body = messageForm.body.trim();
  if (!messageForm.user_id) {
    error.value = "Please select a user.";
    return;
  }
  if (title.length < 2 || body.length < 2) {
    error.value = "Title and message must be at least 2 characters.";
    return;
  }
  try {
    await api.post("/api/notifications", {
      user_id: Number(messageForm.user_id),
      title,
      body
    });
    messageForm.user_id = "";
    messageForm.title = "";
    messageForm.body = "";
    await load();
  } catch (err) {
    const issues = err?.response?.data?.issues;
    if (Array.isArray(issues) && issues.length) {
      error.value = issues.map((i) => i.message).join(", ");
    } else {
      error.value = err?.response?.data?.message || "Failed to send message";
    }
  }
};

onMounted(async () => {
  await load();
  await loadUsers();
});
</script>
