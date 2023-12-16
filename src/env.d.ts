/// <reference types="vite/client" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

declare interface Window {
	mainWindow: API.MainWindow
	settingWindow: API.SettingWindow
	ElectronAPI: API.ElectronAPI
}

interface ImportMetaEnv {
	readonly VITE_DEVTOOLS_ENABLED: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
