import { createApp } from 'vue'
import App from '@/App.vue'
import { setupRouter } from '@/router'
import { setupIconify } from '@/config'
import { setupStore } from '@/store'

import '@/assets/css/index.scss'
import 'overlayscrollbars/overlayscrollbars.css'

setupIconify()

const app = createApp(App)

setupRouter(app)

setupStore(app)

app.mount('#app', true)
