import { createApp } from 'vue'
import App from '@/App.vue'
import { setupRouter } from '@/router'
import { setupIconify } from '@/config'
import { setupStore } from '@/store'
import { setupDirective } from '@/directives'
import { setupI18n } from '@/locales'

import 'overlayscrollbars/overlayscrollbars.css'
import '@/assets/css/index.scss'

setupIconify()

const app = createApp(App)

setupRouter(app)

setupStore(app)

setupDirective(app)

setupI18n(app)

app.mount('#app', true)
