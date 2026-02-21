import { defineStore } from "pinia";

const SIDEBAR_MINI_KEY = "pm_sidebar_mini";
const THEME_KEY = "pm_theme";

const readSidebarMini = () => localStorage.getItem(SIDEBAR_MINI_KEY) === "1";

const readTheme = () => {
  const theme = localStorage.getItem(THEME_KEY);
  return theme === "dark" ? "dark" : "light";
};

export const useUiStore = defineStore("ui", {
  state: () => ({
    sidebarMini: readSidebarMini(),
    theme: readTheme()
  }),
  actions: {
    init() {
      this.applyThemeToDocument();
    },
    toggleSidebarMini() {
      this.sidebarMini = !this.sidebarMini;
      localStorage.setItem(SIDEBAR_MINI_KEY, this.sidebarMini ? "1" : "0");
    },
    setTheme(theme) {
      const nextTheme = theme === "dark" ? "dark" : "light";
      this.theme = nextTheme;
      localStorage.setItem(THEME_KEY, nextTheme);
      this.applyThemeToDocument();
    },
    toggleTheme() {
      this.setTheme(this.theme === "dark" ? "light" : "dark");
    },
    applyThemeToDocument() {
      if (typeof document === "undefined") return;
      document.documentElement.setAttribute("data-theme", this.theme);
      document.documentElement.setAttribute("data-bs-theme", this.theme);
    }
  }
});
