import { app, BrowserWindow } from 'electron'
import Store from 'electron-store'
import { create as createMainWindow } from './mainWindow'

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
