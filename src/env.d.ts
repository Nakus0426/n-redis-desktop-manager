/// <reference types="vite/client" />

import { CreateChildWindowOptions } from '@/utils'

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
	 * create child window
	 */
	createChildWindow: (options: CreateChildWindowOptions) => void
}

declare global {
	interface Window {
		mainWindow: MainWindow
	}
}
