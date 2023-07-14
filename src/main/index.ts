import { app, BrowserWindow } from 'electron'
import path from 'path'

import './mainWindow'

if (require('electron-squirrel-startup')) {
	app.quit()
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		show: false,
		width: 1440,
		height: 900,
		minWidth: 1024,
		minHeight: 640,
		center: true,
		titleBarStyle: 'hidden',
		webPreferences: {
			preload: path.join(__dirname, 'preload.ts'),
			nodeIntegration: true,
		},
	})

	mainWindow.removeMenu()

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	mainWindow.webContents.openDevTools()
}

app.on('ready', () => {
	createWindow()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
