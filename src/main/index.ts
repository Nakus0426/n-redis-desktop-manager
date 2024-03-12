import { app, BrowserWindow } from 'electron'
import { mainWindow } from './windows/main'
import check from 'electron-squirrel-startup'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

app.commandLine.appendSwitch('--enable-features', 'FluentScrollbar,FluentOverlayScrollbar')

if (check) app.quit()

app.on('ready', async () => mainWindow.open())

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) mainWindow.open()
})
