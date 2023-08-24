import { useAppStore } from '@/store'
import { useI18n } from 'vue-i18n'

/**
 * locale hook support muti-window
 */
export function useLocale(sync = true) {
	const { t, locale } = useI18n({ useScope: 'global' })
	const appStore = useAppStore()

	watch(
		() => appStore.locale,
		value => {
			if (!sync) return
			locale.value = value
		}
	)

	return { t, locale }
}
