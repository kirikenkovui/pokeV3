import { createWebHistory, createRouter } from "vue-router";

import { createApp } from "vue";
import App from "./App.vue";

import "./assets/styles/pokemon_types.css";

import ListView from "./comps/List.vue";
import DetailView from "./comps/Detail.vue";
import GameView from "./comps/Game.vue";

const routes = [
  { path: "/", component: ListView },
  { path: "/detail/:id", component: DetailView },
  { path: "/game", component: GameView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.mount("#app");
