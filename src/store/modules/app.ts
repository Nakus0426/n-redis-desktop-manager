import { acceptHMRUpdate, defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'system'

/**
 * app store
 */
export const useAppStore = defineStore(
	'APP',
	() => {
		/**
		 * app theme
		 */
		const theme = ref<Theme>('light')

		/**
		 * app locale
		 */
		const locale = ref<string>()

		/**
		 * change theme
		 */
		function setTheme(_theme: Theme) {
			theme.value = _theme
		}

		return {
			theme,
			locale,
			setTheme,
		}
	},
	{ persist: true }
)

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
