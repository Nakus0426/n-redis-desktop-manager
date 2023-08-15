import type { App } from 'vue'
import { createPinia } from 'pinia'
import { shareStorePlugin } from './plugins/shareStore'

const store = createPinia()

/**
 * setup pinia store
 */
export function setupStore(app: App<Element>) {
	app.use(store)
	store.use(shareStorePlugin)
}

export * from './modules/app'
export * from './modules/links'
