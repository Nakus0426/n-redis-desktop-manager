import { useAppStore } from '@/store/modules/app'
import { useI18n } from 'vue-i18n'

/** locale hook support muti-window */
export function useLocale() {
	const appStore = useAppStore()
	const { t, locale } = useI18n({ useScope: 'global' })
	watch(
		() => appStore.locale,
		value => (locale.value = value),
		{ immediate: true },
	)
	return { t, locale }
}
