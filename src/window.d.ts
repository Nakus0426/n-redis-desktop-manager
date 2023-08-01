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
	 * get app theme
	 */
	getAppTheme: () => 'light' | 'dark'

	/**
	 * get system locale
	 */
	getSystemLocale: () => string

	/**
	 * storage
	 */
	store: {
		/**
		 * get storage size
		 */
		size: () => number

		/**
		 * set an storage item
		 */
		set: (key: string, value: string) => void

		/**
		 * get an storage item
		 */
		get: <T = any>(key: string, defaultValue?: T) => T

		/**
		 * remove an storage item
		 */
		remove: (key: string) => void

		/**
		 * clear all storage items
		 */
		clear: () => void

		/**
		 * get storage key by index
		 */
		key: (index: number) => string
	}

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
		set: typeof import('./utils')['RedisUtil']['prototype']['set']
	}

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
