/// <reference types="vite/client" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

declare module '*.vue' {
	import { type DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}

declare interface Window {
	mainWindow: ElectronAPI.MainWindow
	settingWindow: ElectronAPI.SettingWindow
}

interface ImportMetaEnv {
	readonly VITE_DEVTOOLS_ENABLED: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare interface Document extends DocumentViewTransition {}

declare interface DocumentViewTransition {
	startViewTransition?(updateCallback?: UpdateCallback): ViewTransition
}

interface ViewTransition {
	readonly updateCallbackDone: Promise<void>
	readonly ready: Promise<void>
	readonly finished: Promise<void>

	skipTransition(): void
}

type UpdateCallback = () => any
