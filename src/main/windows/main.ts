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
			width: 1024,
			height: 640,
			minWidth: 1024,
			minHeight: 640,
			center: true,
			frame: false,
			backgroundMaterial: configStore.get('mica') ? 'mica' : 'auto',
			webPreferences: {
				preload: join(__dirname, 'preload.js'),
				nodeIntegration: true,
			},
		})
		// this.instance.removeMenu()
		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) this.instance.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
		else this.instance.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
		nativeTheme.themeSource = configStore.get('theme')
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
			this.handleError(() =>
				redisUtil.create({
					...value,
					error: (id, e) => {
						this.instance.webContents.send(Channels.Main.onError, e.message)
						this.instance.webContents.send(Channels.Main.redis.onError, id, e)
					},
					ready: id => this.instance.webContents.send(Channels.Main.redis.onReady, id),
					end: id => this.instance.webContents.send(Channels.Main.redis.onEnd, id),
					connect: id => this.instance.webContents.send(Channels.Main.redis.onConnect, id),
					reconnect: id => this.instance.webContents.send(Channels.Main.redis.onReconnect, id),
				}),
			),
		)
		ipcMain.handle(Channels.Main.redis.connect, (event, value) => this.handleError(() => redisUtil.connect(value)))
		ipcMain.handle(Channels.Main.redis.disconnect, (event, value) =>
			this.handleError(() => redisUtil.disconnect(value)),
		)
		ipcMain.handle(Channels.Main.redis.destory, (event, value) => this.handleError(() => redisUtil.destory(value)))
		ipcMain.on(
			Channels.Main.redis.isConnected,
			async (event, value) => (event.returnValue = await this.handleError(() => redisUtil.isConnected(value))),
		)
		ipcMain.handle(Channels.Main.redis.ping, (event, id) => redisUtil.ping(id))
		ipcMain.handle(Channels.Main.redis.configGet, (event, id, value) =>
			this.handleError(() => redisUtil.configGet(id, value)),
		)
		ipcMain.handle(Channels.Main.redis.select, (event, id, value) =>
			this.handleError(() => redisUtil.select(id, value)),
		)
		ipcMain.handle(Channels.Main.redis.info, (event, id, value) => this.handleError(() => redisUtil.info(id, value)))
		ipcMain.handle(Channels.Main.redis.keys, (event, id, value) => this.handleError(() => redisUtil.keys(id, value)))
		ipcMain.handle(Channels.Main.redis.set, (event, id, key, value, expire) =>
			this.handleError(() => redisUtil.set(id, key, value, expire)),
		)
		ipcMain.handle(Channels.Main.redis.hset, (event, id, key, field, value) =>
			this.handleError(() => redisUtil.hset(id, key, field, value)),
		)
		ipcMain.handle(Channels.Main.redis.get, (event, id, key, type) => this.handleError(() => redisUtil.get(id, key)))
		ipcMain.handle(Channels.Main.redis.smembers, (event, id, key, type) =>
			this.handleError(() => redisUtil.smembers(id, key)),
		)
		ipcMain.handle(Channels.Main.redis.hget, (event, id, key, type) => this.handleError(() => redisUtil.hget(id, key)))
		ipcMain.handle(Channels.Main.redis.del, (event, id, key) => this.handleError(() => redisUtil.del(id, key)))
		ipcMain.handle(Channels.Main.redis.hdel, (event, id, key, field) =>
			this.handleError(() => redisUtil.hdel(id, key, field)),
		)
		ipcMain.handle(Channels.Main.redis.rename, (event, id, key, newKey) =>
			this.handleError(() => redisUtil.rename(id, key, newKey)),
		)
		ipcMain.handle(Channels.Main.redis.exists, (event, id, key) => this.handleError(() => redisUtil.exists(id, key)))
		ipcMain.handle(Channels.Main.redis.expire, (event, id, key, expire) =>
			this.handleError(() => redisUtil.expire(id, key, expire)),
		)
		ipcMain.handle(Channels.Main.redis.type, (event, id, key) => this.handleError(() => redisUtil.type(id, key)))
		ipcMain.handle(Channels.Main.redis.ttl, (event, id, key) => this.handleError(() => redisUtil.ttl(id, key)))
		ipcMain.handle(Channels.Main.redis.memoryUsage, (event, id, key) =>
			this.handleError(() => redisUtil.memoryUsage(id, key)),
		)
		ipcMain.handle(Channels.Main.redis.srem, (event, id, key, member) =>
			this.handleError(() => redisUtil.srem(id, key, member)),
		)
		ipcMain.handle(Channels.Main.redis.sadd, (event, id, key, member) =>
			this.handleError(() => redisUtil.sadd(id, key, member)),
		)
	}

	/** handle error */
	private async handleError(func: Function) {
		try {
			return await func()
		} catch (e) {
			this.instance.webContents.send(Channels.Main.onError, e.message)
			throw new Error(e.message)
		}
	}
}

export const mainWindow = new MainWindow()
