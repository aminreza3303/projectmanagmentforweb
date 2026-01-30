<template>
  <div class="row justify-content-center">
    <div class="col-md-5">
      <h2 class="mb-1">Register</h2>
      <div class="text-muted small mb-3">Create your workspace</div>
      <div v-if="auth.error" class="alert alert-danger">{{ auth.error }}</div>
      <form @submit.prevent="onSubmit" class="card-plain">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Role</label>
          <select v-model="role" class="form-select">
            <option value="member">Team member</option>
            <option value="manager">Project manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button class="btn btn-outline-secondary" :disabled="auth.loading">Create account</button>
      </form>
      <div class="mt-3">
        Already have an account? <router-link to="/login">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();
const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("member");

const onSubmit = async () => {
  const ok = await auth.register({
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value
  });
  if (ok) router.push("/dashboard");
};
</script>
