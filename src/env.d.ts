/// <reference types="vite/client" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

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
