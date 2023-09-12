import { app, BrowserWindow, session } from 'electron'
import { resolve } from 'node:path'
import { createMainWindow } from './windows'

if (require('electron-squirrel-startup')) app.quit()

const vueDevtoolsPath = resolve(__dirname, '../../extensions/vue-devtools')

app.on('ready', async () => {
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) await session.defaultSession.loadExtension(vueDevtoolsPath)
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
