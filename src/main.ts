import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import Markdown from 'vue3-markdown-it'
import RouterViewContainer from './RouterViewContainer.vue'

const Home = () => import('./components/Home.vue')
const AppContainer = () => import('./AppContainer.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: AppContainer }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(RouterViewContainer)
app.use(Markdown)
app.use(router)
app.mount('#app')
