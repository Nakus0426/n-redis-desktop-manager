import { createApp } from 'vue'
import App from '@/App.vue'
import { setupRouter } from '@/router'
import { setupIconify } from '@/config'
import { setupStore } from '@/store'
import { setupDirective } from '@/directives'

import '@/assets/css/index.scss'
import 'overlayscrollbars/overlayscrollbars.css'

setupIconify()

const app = createApp(App)

setupRouter(app)

setupStore(app)

setupDirective(app)

app.mount('#app', true)
