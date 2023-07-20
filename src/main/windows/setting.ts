import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'

/**
 * create setting window
 */
export function createSettingWindow() {
	let settingWindow = new BrowserWindow({
		show: false,
		width: 800,
		height: 500,
		center: true,
		resizable: false,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	settingWindow.on('ready-to-show', () => {
		settingWindow.show()
	})

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		settingWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/setting`)
	} else {
		settingWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html/#/setting`))
	}

	if (import.meta.env.DEV) settingWindow.webContents.openDevTools()

	settingWindow.on('closed', e => {
		settingWindow = null
	})

	ipcMain.on('minimizeSettingWindow', () => {
		if (settingWindow) settingWindow.minimize()
	})
	ipcMain.on('closeSettingWindow', () => {
		if (settingWindow) settingWindow.close()
	})
}
