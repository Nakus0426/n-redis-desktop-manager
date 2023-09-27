import { ipcMain, BrowserWindow, nativeTheme, app } from 'electron'
import path from 'path'
import { SettingWindow } from './setting'
import { channel } from './channels'
import { RedisUtil } from '@/utils'

export function createMainWindow() {
	const mainWindow = new BrowserWindow({
		icon: './src/assets/icons/logo.ico',
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

	if (import.meta.env.DEV) mainWindow.webContents.openDevTools()

	const settingWindow = new SettingWindow()
	const redis = new RedisUtil()

	// window operations
	ipcMain.on(channel.main.minimize, () => mainWindow.minimize())
	ipcMain.on(channel.main.maximize, () => mainWindow.maximize())
	ipcMain.on(channel.main.unmaximize, () => mainWindow.unmaximize())
	ipcMain.on(channel.main.openSetting, () => settingWindow.open())
	ipcMain.on(channel.main.close, () => BrowserWindow.getAllWindows().forEach(item => item.close()))
	mainWindow.on('minimize', () => mainWindow.webContents.send(channel.main.onMinimize))
	mainWindow.on('maximize', () => mainWindow.webContents.send(channel.main.onMaximize))
	mainWindow.on('unmaximize', () => mainWindow.webContents.send(channel.main.onUnmaximize))

	// app operations
	ipcMain.on(channel.main.getAppTheme, event => {
		event.returnValue = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
	})
	ipcMain.on(channel.main.getSystemLocale, event => {
		event.returnValue = app.getSystemLocale()
	})

	// pinia operations
	ipcMain.on(channel.main.pinia.change, (event, key, value, isResetVersion, storeVersion) => {
		BrowserWindow.getAllWindows().forEach(window => {
			const webContentsId = window.webContents.id
			if (webContentsId !== event.sender.id && !window.isDestroyed()) {
				window.webContents.send(channel.main.pinia.onChange, key, value, isResetVersion, storeVersion)
			}
		})
	})

	// redis operations
	ipcMain.handle(channel.main.redis.create, (event, value) =>
		redis.create({
			...value,
			error: (id, error) => {
				mainWindow.webContents.send(channel.main.onError, error.message)
				mainWindow.webContents.send(channel.main.redis.onError, id, error)
			},
			ready: id => mainWindow.webContents.send(channel.main.redis.onReady, id),
			end: id => mainWindow.webContents.send(channel.main.redis.onEnd, id),
			connect: id => mainWindow.webContents.send(channel.main.redis.onConnect, id),
			reconnect: id => mainWindow.webContents.send(channel.main.redis.onReconnect, id),
		})
	)
	ipcMain.handle(channel.main.redis.connect, (event, value) => redis.connect(value))
	ipcMain.handle(channel.main.redis.disconnect, (event, value) => redis.disconnect(value))
	ipcMain.handle(channel.main.redis.destory, (event, value) => redis.destory(value))
	ipcMain.on(channel.main.redis.isConnected, (event, value) => {
		event.returnValue = redis.isConnected(value)
	})
	ipcMain.handle(channel.main.redis.ping, (event, id) => redis.ping(id))
	ipcMain.handle(channel.main.redis.configGet, (event, id, value) => redis.configGet(id, value))
	ipcMain.handle(channel.main.redis.select, (event, id, value) => redis.select(id, value))
	ipcMain.handle(channel.main.redis.info, (event, id, value) => redis.info(id, value))
	ipcMain.handle(channel.main.redis.keys, (event, id, value) => redis.keys(id, value))
	ipcMain.handle(channel.main.redis.set, (event, id, key, value, expire) => redis.set(id, key, value, expire))
	ipcMain.handle(channel.main.redis.get, (event, id, key, type) => redis.get(id, key, type))
	ipcMain.handle(channel.main.redis.del, (event, id, key) => redis.del(id, key))
	ipcMain.handle(channel.main.redis.type, (event, id, key) => redis.type(id, key))
	ipcMain.handle(channel.main.redis.ttl, (event, id, key) => redis.ttl(id, key))
}
