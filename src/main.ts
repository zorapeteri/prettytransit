import './assets/main.css'

import { createApp } from 'vue'
// @ts-ignore
import Markdown from 'vue3-markdown-it'
import App from './AppContainer.vue'

const app = createApp(App)
app.use(Markdown)
app.mount('#app')
