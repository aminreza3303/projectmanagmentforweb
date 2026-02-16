<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Report Details</h2>
        <div class="text-muted small">Report {{ id }}</div>
      </div>
      <router-link class="btn btn-outline-secondary" to="/reports">Back</router-link>
    </div>

    <div v-if="error" class="text-danger small mb-2">{{ error }}</div>
    <div v-if="!report" class="text-muted small">Loading report...</div>

    <div v-else class="card-plain">
      <div><strong>Type:</strong> {{ report.type }}</div>
      <div><strong>Project:</strong> {{ report.project?.title || report.projectId }}</div>
      <div><strong>Created at:</strong> {{ formatDateTime(report.createdAt) }}</div>
      <div class="mt-2">{{ report.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../api/client";

const route = useRoute();
const id = String(route.params.id);
const report = ref(null);
const error = ref("");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

const load = async () => {
  error.value = "";
  try {
    const { data } = await api.get(`/api/reports/${id}`);
    report.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load report";
  }
};

onMounted(async () => {
  await load();
});
</script>
