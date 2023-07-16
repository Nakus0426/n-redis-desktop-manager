import { app, ipcMain, BrowserWindow } from 'electron'
import path from 'path'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

if (require('electron-squirrel-startup')) {
	app.quit()
}

let mainWindow: BrowserWindow

function createWindow() {
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

	mainWindow.webContents.openDevTools()

	return mainWindow
}

function setupIpcIn() {
	ipcMain.on('minimizeMainWindow', () => mainWindow.minimize())
	ipcMain.on('maximizeMainWindow', () => mainWindow.maximize())
	ipcMain.on('unmaximizeMainWindow', () => mainWindow.unmaximize())
}

function setupIpcOut() {
	mainWindow.on('minimize', () => mainWindow.webContents.send('onMainWindowMinimize'))
	mainWindow.on('maximize', () => mainWindow.webContents.send('onMainWindowMaximize'))
	mainWindow.on('unmaximize', () => mainWindow.webContents.send('onMainWindowUnMaximize'))
}

app.on('ready', () => {
	mainWindow = createWindow()
	setupIpcIn()
	setupIpcOut()
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
