import { app, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { createMainWindow } from './windows'

if (require('electron-squirrel-startup')) app.quit()

app.on('ready', () => {
	createMainWindow()
	Store.initRenderer()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow()
	}
})
