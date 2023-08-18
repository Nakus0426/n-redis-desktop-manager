export {}

export interface MainWindow {
	/**
	 * minimize window
	 */
	minimize: () => void

	/**
	 * maximize window
	 */
	maximize: () => void

	/**
	 * unmaximize window
	 */
	unmaximize: () => void

	/**
	 * open setting window
	 */
	openSettingWindow: () => void

	/**
	 * close window
	 */
	close: () => void

	/**
	 * window minimize event
	 */
	onMinimize: (callback: () => void) => void

	/**
	 * window maximize event
	 */
	onMaximize: (callback: () => void) => void

	/**
	 * window unmaximize event
	 */
	onUnMaximize: (callback: () => void) => void

	/**
	 * on error
	 */
	onError: (callback: (error: any) => void) => void

	/**
	 * get app theme
	 */
	getAppTheme: () => 'light' | 'dark'

	/**
	 * get system locale
	 */
	getSystemLocale: () => string

	/**
	 * pinia
	 */
	pinia: {
		/**
		 * change pinia state
		 */
		change: (key: string, value: any, isResetVersion: boolean, storeVersion: string) => void

		/**
		 * handle pinia state change event
		 */
		onChange: (callback: (key: string, value: any, isResetVersion: boolean, storeVersion: string) => void) => void
	}

	/**
	 * redis
	 */
	redis: {
		create: typeof import('./utils')['RedisUtil']['prototype']['create']
		connect: typeof import('./utils')['RedisUtil']['prototype']['connect']
		disconnect: typeof import('./utils')['RedisUtil']['prototype']['disconnect']
		isConnected: typeof import('./utils')['RedisUtil']['prototype']['isConnected']
		set: typeof import('./utils')['RedisUtil']['prototype']['set']
		onReady: (callback: (id: string) => void) => void
	}
}

export interface SettingWindow {
	/**
	 * minimize window
	 */
	minimize: () => void

	/**
	 * close window
	 */
	close: () => void
}

export as namespace ElectronAPI
