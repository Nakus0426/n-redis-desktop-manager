import type { App } from 'vue'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

export function setupI18n(app: App) {
	app.use(
		createI18n({
			locale: 'zh-CN',
			messages,
		})
	)
}
