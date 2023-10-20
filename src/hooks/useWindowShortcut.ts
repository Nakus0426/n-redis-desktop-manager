import { useMagicKeys, whenever } from '@vueuse/core'

type BrowserWindowType = 'mainWindow' | 'settingWindow'

/* browser window shortcut hook */
export function useWindowShortcut(browserWindowType: BrowserWindowType) {
	const keys = useMagicKeys()
	const browserWindow = window[browserWindowType] as Window['mainWindow'] & Window['settingWindow']

	// open devtool
	whenever(keys['Ctrl+Shift+KeyI'], () => browserWindow.openDevtools())

	// minimize window
	whenever(keys['Escape'], () => browserWindow.minimize())
}
