import { ipcMain, BrowserWindow } from 'electron'
import path from 'path'
import { createSettingWindow } from './setting'

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

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	if (import.meta.env.DEV) mainWindow.webContents.openDevTools()

	ipcMain.on('minimizeMainWindow', () => mainWindow.minimize())
	ipcMain.on('maximizeMainWindow', () => mainWindow.maximize())
	ipcMain.on('unmaximizeMainWindow', () => mainWindow.unmaximize())
	ipcMain.on('openSettingWindow', () => createSettingWindow())
	ipcMain.on('closeMainWindow', () => mainWindow.close())

	mainWindow.on('minimize', () => mainWindow.webContents.send('onMainWindowMinimize'))
	mainWindow.on('maximize', () => mainWindow.webContents.send('onMainWindowMaximize'))
	mainWindow.on('unmaximize', () => mainWindow.webContents.send('onMainWindowUnMaximize'))
}
