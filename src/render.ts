import { createApp } from 'vue'
import App from '@/App.vue'
import { setupRouter } from '@/router'
import { setupIconify } from '@/config/iconifyConfig'
import { setupOverlayScrollbars } from '@/config/overlayScrollbarConfig'
import { setupStore } from '@/store'
import { setupDirective } from '@/directives'
import { setupI18n } from '@/locales'

import '@/assets/css/index.scss'
import 'overlayscrollbars/overlayscrollbars.css'
import 'animate.css'

setupIconify()

setupOverlayScrollbars()

const app = createApp(App)

setupRouter(app)

setupStore(app)

setupDirective(app)

setupI18n(app)

app.mount('#app', true)
