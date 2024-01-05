import { app, BrowserWindow } from 'electron'
import { mainWindow } from './windows/main'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

if (require('electron-squirrel-startup')) app.quit()

app.on('ready', async () => mainWindow.open())

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) mainWindow.open()
})
