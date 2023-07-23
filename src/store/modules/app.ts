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

		return {
			theme,
		}
	},
	{ persist: true }
)

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
