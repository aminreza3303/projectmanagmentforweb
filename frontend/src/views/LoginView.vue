<template>
  <div class="row justify-content-center">
    <div class="col-md-5">
      <h2 class="mb-1">Login</h2>
      <div class="text-muted small mb-3">Welcome back</div>
      <div v-if="auth.error" class="alert alert-danger">{{ auth.error }}</div>
      <form @submit.prevent="onSubmit" class="card-plain">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <button class="btn btn-outline-secondary" :disabled="auth.loading">Sign in</button>
      </form>
      <div class="mt-3">
        Don't have an account? <router-link to="/register">Register</router-link>
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
const email = ref("");
const password = ref("");

const onSubmit = async () => {
  const ok = await auth.login({ email: email.value, password: password.value });
  if (ok) router.push("/dashboard");
};
</script>
