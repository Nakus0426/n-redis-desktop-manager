import { ipcMain, BrowserWindow, nativeTheme, app, type NativeTheme } from 'electron'
const { MicaBrowserWindow, IS_WINDOWS_11 } = require('mica-electron')
import { MicaBrowserWindow as MicaBrowserWindowType } from 'mica-electron'
import path from 'path'
import { SettingWindow } from './setting'
import { channel } from './channels'
import { RedisUtil } from '@/utils'
import { configStore } from '../configStore'

let mainWindow: MicaBrowserWindowType
const redis = new RedisUtil()

export function createMainWindow() {
	mainWindow = new MicaBrowserWindow({
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

	mainWindow.removeMenu()
	initMica()
	initAppTheme()

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
	}

	mainWindow.on('ready-to-show', () => mainWindow.show())
	mainWindow.on('minimize', () => mainWindow.webContents.send(channel.main.onMinimize))
	mainWindow.on('maximize', () => mainWindow.webContents.send(channel.main.onMaximize))
	mainWindow.on('unmaximize', () => mainWindow.webContents.send(channel.main.onUnmaximize))
	mainWindow.on('close', () => {
		BrowserWindow.getAllWindows().forEach(item => {
			if (item.id === mainWindow.id) return
			item.close()
		})
	})
}

// window operations
ipcMain.on(channel.main.minimize, () => mainWindow.minimize())
ipcMain.on(channel.main.maximize, () => mainWindow.maximize())
ipcMain.on(channel.main.unmaximize, () => mainWindow.unmaximize())
ipcMain.on(channel.main.openSetting, () => SettingWindow.open())
ipcMain.on(channel.main.openDevtools, () => mainWindow.webContents.openDevTools())
ipcMain.on(channel.main.close, () => mainWindow.close())
ipcMain.on(channel.main.reload, () => mainWindow.reload())

// app operations
ipcMain.on(channel.main.getAppTheme, event => {
	event.returnValue = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
})
ipcMain.on(channel.main.setAppTheme, (event, theme) => {
	nativeTheme.themeSource = theme
	configStore.set('appTheme', theme)
	initAppTheme(theme)
})
ipcMain.on(channel.main.getSystemLocale, event => {
	event.returnValue = app.getSystemLocale()
})
ipcMain.on(channel.main.getConfig, (event, key) => (event.returnValue = configStore.get(key)))
ipcMain.on(channel.main.setConfig, (event, key, value) => configStore.set(key, value))
ipcMain.on(channel.main.isWindows11, event => {
	event.returnValue = IS_WINDOWS_11
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
	}),
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
ipcMain.handle(channel.main.redis.hset, (event, id, key, field, value) => redis.hset(id, key, field, value))
ipcMain.handle(channel.main.redis.get, (event, id, key, type) => redis.get(id, key, type))
ipcMain.handle(channel.main.redis.del, (event, id, key) => redis.del(id, key))
ipcMain.handle(channel.main.redis.hdel, (event, id, key, field) => redis.hdel(id, key, field))
ipcMain.handle(channel.main.redis.rename, (event, id, key, newKey) => redis.rename(id, key, newKey))
ipcMain.handle(channel.main.redis.exists, (event, id, key) => redis.exists(id, key))
ipcMain.handle(channel.main.redis.expire, (event, id, key, expire) => redis.expire(id, key, expire))
ipcMain.handle(channel.main.redis.type, (event, id, key) => redis.type(id, key))
ipcMain.handle(channel.main.redis.ttl, (event, id, key) => redis.ttl(id, key))
ipcMain.handle(channel.main.redis.memoryUsage, (event, id, key) => redis.memoryUsage(id, key))
ipcMain.handle(channel.main.redis.srem, (event, id, key, member) => redis.srem(id, key, member))
ipcMain.handle(channel.main.redis.sadd, (event, id, key, member) => redis.sadd(id, key, member))

function initMica() {
	if (!IS_WINDOWS_11) return
	const enable = configStore.get('appMicaConfig', false)
	if (enable) mainWindow.setMicaEffect()
}

function initAppTheme(theme?: NativeTheme['themeSource']) {
	const _theme = theme || configStore.get('appTheme', 'light')
	if (_theme === 'dark') mainWindow.setDarkTheme()
	if (_theme === 'light') mainWindow.setLightTheme()
	if (_theme === 'system') mainWindow.setAutoTheme()
}
