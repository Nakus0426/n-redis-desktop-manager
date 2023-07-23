import { ipcMain, BrowserWindow, nativeTheme } from 'electron'
import path from 'path'
import Store from 'electron-store'
import { SettingWindow } from './setting'
import { channel } from './channels'

export function createMainWindow() {
	const mainWindow = new BrowserWindow({
		show: false,
		width: 1440,
		height: 900,
		minWidth: 1024,
		minHeight: 640,
		center: true,
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
		},
	})

	const store = new Store()

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	if (import.meta.env.DEV) mainWindow.webContents.openDevTools()

	const settingWindow = new SettingWindow()

	// functions
	ipcMain.on(channel.main.minimize, () => mainWindow.minimize())
	ipcMain.on(channel.main.maximize, () => mainWindow.maximize())
	ipcMain.on(channel.main.unmaximize, () => mainWindow.unmaximize())
	ipcMain.on(channel.main.openSetting, () => settingWindow.open())
	ipcMain.on(channel.main.close, () => mainWindow.close())
	ipcMain.on(channel.main.getAppTheme, event => {
		event.returnValue = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
	})
	// storage
	ipcMain.on(channel.main.store.size, event => {
		event.returnValue = store.size
	})
	ipcMain.on(channel.main.store.set, (event, key, value) => store.set(key, value))
	ipcMain.on(channel.main.store.get, (event, key, defaultValue) => {
		event.returnValue = store.get(key, defaultValue)
	})
	ipcMain.on(channel.main.store.remove, (event, key) => store.delete(key))
	ipcMain.on(channel.main.store.clear, () => store.clear())
	ipcMain.on(channel.main.store.key, (event, index) => {
		event.returnValue = Object.keys(store.store)[index]
	})
	// pinia
	ipcMain.on(channel.main.pinia.change, (event, key, value, isResetVersion, storeVersion) => {
		BrowserWindow.getAllWindows().forEach(window => {
			const webContentsId = window.webContents.id
			if (webContentsId !== event.sender.id && !window.isDestroyed()) {
				window.webContents.send(channel.main.pinia.onChange, key, value, isResetVersion, storeVersion)
			}
		})
	})

	// events
	mainWindow.on('minimize', () => mainWindow.webContents.send(channel.main.onMinimize))
	mainWindow.on('maximize', () => mainWindow.webContents.send(channel.main.onMaximize))
	mainWindow.on('unmaximize', () => mainWindow.webContents.send(channel.main.onUnmaximize))
}
