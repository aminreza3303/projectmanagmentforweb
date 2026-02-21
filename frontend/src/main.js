import { createApp } from "vue";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/base.css";
import App from "./App.vue";
import router from "./router";
import { useUiStore } from "./stores/ui";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
const ui = useUiStore(pinia);
ui.init();
app.use(router);
app.mount("#app");
