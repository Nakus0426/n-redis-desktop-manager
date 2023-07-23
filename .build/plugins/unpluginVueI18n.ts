import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import path from 'path'

/**
 * setup unplugin-vue-i18n plugin
 */
export function setupUnpluginVueI18n() {
	return VueI18nPlugin({ include: path.resolve(process.cwd(), './src/locales/**.json') })
}
