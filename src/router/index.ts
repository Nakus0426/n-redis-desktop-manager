import { createRouter, createWebHashHistory } from 'vue-router'
import { App } from 'vue'
import { routes } from './routes'

export const router = createRouter({
	history: createWebHashHistory(),
	routes: routes,
	strict: true,
	scrollBehavior: () => ({ left: 0, top: 0 }),
})

/** setup router */
export function setupRouter(app: App<Element>) {
	app.use(router)
}
