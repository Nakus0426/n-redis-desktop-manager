import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'system'

/**
 * app store
 */
export const useAppStore = defineStore(
	'APP',
	() => {
		/** app theme */
		const theme = ref<Theme>('light')

		/** is dark theme */
		const isDarkTheme = computed(() => {
			const _theme = theme.value === 'system' ? window.mainWindow.getAppTheme() : theme.value
			return _theme === 'dark'
		})

		/** app locale */
		const locale = ref<string>()

		/** mica enable */
		const micaEnable = ref<boolean>(window.mainWindow.getConfig('mica'))

		/** change theme */
		function setTheme(_theme: Theme) {
			theme.value = _theme
			window.mainWindow.setAppTheme(_theme)
		}

		// watch app theme change and set the theme
		watch(
			theme,
			value => {
				if (['dark', 'light'].includes(value)) setAppTheme(value)
				if (value === 'system') setAppTheme(window.mainWindow.getAppTheme())
			},
			{ immediate: true },
		)
		function setAppTheme(_theme: Theme) {
			const css = document.createElement('style')
			css.appendChild(
				document.createTextNode(
					`* {
					 -webkit-transition: none !important;
					 -moz-transition: none !important;
					 -o-transition: none !important;
					 -ms-transition: none !important;
					 transition: none !important;
				}`,
				),
			)
			document.head.appendChild(css)
			theme.value = _theme
			document.head.removeChild(css)
		}

		/** init app locale */
		function initAppLocale() {
			const systemLocale = window.mainWindow.getSystemLocale()
			locale.value = locale.value || systemLocale
		}

		// watch config change
		watch(micaEnable, value => window.mainWindow.setConfig('mica', value))

		return {
			theme,
			isDarkTheme,
			locale,
			micaEnable,
			setTheme,
			initAppLocale,
		}
	},
	{ persist: true },
)
