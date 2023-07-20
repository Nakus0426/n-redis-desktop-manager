declare namespace ElectronAPI {
	interface MainWindow {
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
	}
	interface SettingWindow {
		/**
		 * minimize window
		 */
		minimize: () => void
		/**
		 * close window
		 */
		close: () => void
	}
}
