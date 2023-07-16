export interface MainWindow {
	/**
	 * minimize Window
	 */
	minimize: () => void
	/**
	 * maximize Window
	 */
	maximize: () => void
	/**
	 * unmaximize Window
	 */
	unmaximize: () => void
	/**
	 * Window minimize event
	 */
	onMinimize: (callback: () => void) => void
	/**
	 * Window maximize event
	 */
	onMaximize: (callback: () => void) => void
	/**
	 * Window unmaximize event
	 */
	onUnMaximize: (callback: () => void) => void
}

declare global {
	interface Window {
		mainWindow: MainWindow
	}
}
