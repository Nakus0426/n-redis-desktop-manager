import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './windows'

if (require('electron-squirrel-startup')) app.quit()

console.log(app.getAppPath())

app.on('ready', () => {
	createMainWindow()
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
