import { ipcMain, BrowserWindow, nativeTheme, app } from 'electron'
import { join } from 'path'
import { settingWindow } from './setting'
import { Channels } from './channels'
import { redisUtil } from '@/utils/RedisUtil'
import { configStore } from '../configStore'

class MainWindow {
	private instance: BrowserWindow

	constructor() {}

	/** open window */
	open() {
		if (this.instance) {
			this.instance.show()
			return
		}
		this.instance = new BrowserWindow({
			icon: './src/assets/icons/logo.ico',
			show: false,
			width: 1440,
			height: 900,
			minWidth: 1024,
			minHeight: 640,
			center: true,
			frame: false,
			webPreferences: {
				preload: join(__dirname, 'preload.js'),
				nodeIntegration: true,
			},
		})
		// this.instance.removeMenu()
		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) this.instance.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
		else this.instance.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
		this.setupEvents()
		this.setupIpc()
	}

	/** setup window event */
	private setupEvents() {
		this.instance.on('ready-to-show', () => this.instance.show())
		this.instance.on('minimize', () => this.instance.webContents.send(Channels.Main.onMinimize))
		this.instance.on('maximize', () => this.instance.webContents.send(Channels.Main.onMaximize))
		this.instance.on('unmaximize', () => this.instance.webContents.send(Channels.Main.onUnmaximize))
		this.instance.on('close', () =>
			BrowserWindow.getAllWindows().forEach(item => {
				if (item.id !== this.instance.id) item.close()
			}),
		)
	}

	/** setup window ipc */
	private setupIpc() {
		ipcMain.on(Channels.Main.minimize, () => this.instance.minimize())
		ipcMain.on(Channels.Main.maximize, () => this.instance.maximize())
		ipcMain.on(Channels.Main.unmaximize, () => this.instance.unmaximize())
		ipcMain.on(Channels.Main.openSetting, () => settingWindow.open())
		ipcMain.on(Channels.Main.openDevtools, () => this.instance.webContents.openDevTools())
		ipcMain.on(Channels.Main.close, () => this.instance.close())
		ipcMain.on(Channels.Main.reload, () => this.instance.reload())
		ipcMain.on(Channels.Main.getAppTheme, event => {
			event.returnValue = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
		})
		ipcMain.on(Channels.Main.setAppTheme, (event, theme) => {
			nativeTheme.themeSource = theme
			configStore.set('theme', theme)
		})
		ipcMain.on(Channels.Main.getSystemLocale, event => {
			event.returnValue = app.getSystemLocale()
		})
		ipcMain.on(Channels.Main.getConfig, (event, key) => (event.returnValue = configStore.get(key)))
		ipcMain.on(Channels.Main.setConfig, (event, key, value) => configStore.set(key, value))
		ipcMain.on(Channels.Main.pinia.change, (event, key, value, isResetVersion, storeVersion) => {
			BrowserWindow.getAllWindows().forEach(window => {
				const webContentsId = window.webContents.id
				if (webContentsId !== event.sender.id && !window.isDestroyed()) {
					window.webContents.send(Channels.Main.pinia.onChange, key, value, isResetVersion, storeVersion)
				}
			})
		})
		ipcMain.handle(Channels.Main.redis.create, (event, value) =>
			redisUtil.create({
				...value,
				error: (id, error) => {
					this.instance.webContents.send(Channels.Main.onError, error.message)
					this.instance.webContents.send(Channels.Main.redis.onError, id, error)
				},
				ready: id => this.instance.webContents.send(Channels.Main.redis.onReady, id),
				end: id => this.instance.webContents.send(Channels.Main.redis.onEnd, id),
				connect: id => this.instance.webContents.send(Channels.Main.redis.onConnect, id),
				reconnect: id => this.instance.webContents.send(Channels.Main.redis.onReconnect, id),
			}),
		)
		ipcMain.handle(Channels.Main.redis.connect, (event, value) => redisUtil.connect(value))
		ipcMain.handle(Channels.Main.redis.disconnect, (event, value) => redisUtil.disconnect(value))
		ipcMain.handle(Channels.Main.redis.destory, (event, value) => redisUtil.destory(value))
		ipcMain.on(Channels.Main.redis.isConnected, (event, value) => (event.returnValue = redisUtil.isConnected(value)))
		ipcMain.handle(Channels.Main.redis.ping, (event, id) => redisUtil.ping(id))
		ipcMain.handle(Channels.Main.redis.configGet, (event, id, value) => redisUtil.configGet(id, value))
		ipcMain.handle(Channels.Main.redis.select, (event, id, value) => redisUtil.select(id, value))
		ipcMain.handle(Channels.Main.redis.info, (event, id, value) => redisUtil.info(id, value))
		ipcMain.handle(Channels.Main.redis.keys, (event, id, value) => redisUtil.keys(id, value))
		ipcMain.handle(Channels.Main.redis.set, (event, id, key, value, expire) => redisUtil.set(id, key, value, expire))
		ipcMain.handle(Channels.Main.redis.hset, (event, id, key, field, value) => redisUtil.hset(id, key, field, value))
		ipcMain.handle(Channels.Main.redis.get, (event, id, key, type) => redisUtil.get(id, key))
		ipcMain.handle(Channels.Main.redis.smembers, (event, id, key, type) => redisUtil.smembers(id, key))
		ipcMain.handle(Channels.Main.redis.hget, (event, id, key, type) => redisUtil.hget(id, key))
		ipcMain.handle(Channels.Main.redis.del, (event, id, key) => redisUtil.del(id, key))
		ipcMain.handle(Channels.Main.redis.hdel, (event, id, key, field) => redisUtil.hdel(id, key, field))
		ipcMain.handle(Channels.Main.redis.rename, (event, id, key, newKey) => redisUtil.rename(id, key, newKey))
		ipcMain.handle(Channels.Main.redis.exists, (event, id, key) => redisUtil.exists(id, key))
		ipcMain.handle(Channels.Main.redis.expire, (event, id, key, expire) => redisUtil.expire(id, key, expire))
		ipcMain.handle(Channels.Main.redis.type, (event, id, key) => redisUtil.type(id, key))
		ipcMain.handle(Channels.Main.redis.ttl, (event, id, key) => redisUtil.ttl(id, key))
		ipcMain.handle(Channels.Main.redis.memoryUsage, (event, id, key) => redisUtil.memoryUsage(id, key))
		ipcMain.handle(Channels.Main.redis.srem, (event, id, key, member) => redisUtil.srem(id, key, member))
		ipcMain.handle(Channels.Main.redis.sadd, (event, id, key, member) => redisUtil.sadd(id, key, member))
	}
}

export const mainWindow = new MainWindow()
