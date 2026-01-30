import { defineStore } from "pinia";
import api from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || "",
    loading: false,
    error: ""
  }),
  actions: {
    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;
      }
    },
    async login(payload) {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await api.post("/api/auth/login", payload);
        this.setToken(data.token);
        this.user = data.user;
        return true;
      } catch (err) {
        this.error = err?.response?.data?.message || "Login failed";
        return false;
      } finally {
        this.loading = false;
      }
    },
    async register(payload) {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await api.post("/api/auth/register", payload);
        this.setToken(data.token);
        this.user = data.user;
        return true;
      } catch (err) {
        this.error = err?.response?.data?.message || "Register failed";
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      if (!this.token) return null;
      try {
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
        const { data } = await api.get("/api/auth/me");
        this.user = data;
        return data;
      } catch {
        this.setToken("");
        this.user = null;
        return null;
      }
    },
    logout() {
      this.setToken("");
      this.user = null;
    }
  }
});
