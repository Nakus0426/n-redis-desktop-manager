import { createApp } from 'vue'
import App from '@/App.vue'
import { setupRouter } from '@/router'
import { setupIconify } from '@/config'

import '@/assets/css/index.scss'

setupIconify()

const app = createApp(App)

setupRouter(app)

app.mount('#app', true)