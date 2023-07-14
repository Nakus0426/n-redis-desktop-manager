import { app, ipcMain } from 'electron'

app.on('ready', () => {
	ipcMain.on('test', () => {
		console.log('test')
	})
})
