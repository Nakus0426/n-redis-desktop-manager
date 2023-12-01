import { contextBridge, ipcRenderer } from 'electron'
import { channel } from './windows/channels'

// main window
contextBridge.exposeInMainWorld('mainWindow', {
	// window operations
	minimize: () => ipcRenderer.send(channel.main.minimize),
	maximize: () => ipcRenderer.send(channel.main.maximize),
	unmaximize: () => ipcRenderer.send(channel.main.unmaximize),
	openSettingWindow: () => ipcRenderer.send(channel.main.openSetting),
	openDevtools: () => ipcRenderer.send(channel.main.openDevtools),
	close: () => ipcRenderer.send(channel.main.close),
	reload: () => ipcRenderer.send(channel.main.reload),
	onMinimize: callback => ipcRenderer.on(channel.main.onMinimize, callback),
	onMaximize: callback => ipcRenderer.on(channel.main.onMaximize, callback),
	onUnMaximize: callback => ipcRenderer.on(channel.main.onUnmaximize, callback),
	onError: callback => ipcRenderer.on(channel.main.onError, (e, ...args) => callback(...args)),
	// app operations
	getAppTheme: () => ipcRenderer.sendSync(channel.main.getAppTheme),
	setAppTheme: (...args) => ipcRenderer.send(channel.main.setAppTheme, ...args),
	getSystemLocale: () => ipcRenderer.sendSync(channel.main.getSystemLocale),
	getConfig: (...args) => ipcRenderer.sendSync(channel.main.getConfig, ...args),
	setConfig: (...args) => ipcRenderer.send(channel.main.setConfig, ...args),
	isWindows11: () => ipcRenderer.sendSync(channel.main.isWindows11),
	// pinia operations
	pinia: {
		change: (...args) => ipcRenderer.send(channel.main.pinia.change, ...args),
		onChange: callback => ipcRenderer.on(channel.main.pinia.onChange, (e, ...args) => callback(...args)),
	},
	// redis operations
	redis: {
		create: (...args) => ipcRenderer.invoke(channel.main.redis.create, ...args),
		connect: (...args) => ipcRenderer.invoke(channel.main.redis.connect, ...args),
		disconnect: (...args) => ipcRenderer.invoke(channel.main.redis.disconnect, ...args),
		destory: (...args) => ipcRenderer.invoke(channel.main.redis.destory, ...args),
		isConnected: (...args) => ipcRenderer.sendSync(channel.main.redis.isConnected, ...args),
		ping: (...args) => ipcRenderer.invoke(channel.main.redis.ping, ...args),
		configGet: (...args) => ipcRenderer.invoke(channel.main.redis.configGet, ...args),
		select: (...args) => ipcRenderer.invoke(channel.main.redis.select, ...args),
		info: (...args) => ipcRenderer.invoke(channel.main.redis.info, ...args),
		keys: (...args) => ipcRenderer.invoke(channel.main.redis.keys, ...args),
		set: (...args) => ipcRenderer.invoke(channel.main.redis.set, ...args),
		hset: (...args) => ipcRenderer.invoke(channel.main.redis.hset, ...args),
		get: (...args) => ipcRenderer.invoke(channel.main.redis.get, ...args),
		del: (...args) => ipcRenderer.invoke(channel.main.redis.del, ...args),
		hdel: (...args) => ipcRenderer.invoke(channel.main.redis.hdel, ...args),
		rename: (...args) => ipcRenderer.invoke(channel.main.redis.rename, ...args),
		exists: (...args) => ipcRenderer.invoke(channel.main.redis.exists, ...args),
		expire: (...args) => ipcRenderer.invoke(channel.main.redis.expire, ...args),
		type: (...args) => ipcRenderer.invoke(channel.main.redis.type, ...args),
		ttl: (...args) => ipcRenderer.invoke(channel.main.redis.ttl, ...args),
		memoryUsage: (...args) => ipcRenderer.invoke(channel.main.redis.memoryUsage, ...args),
		srem: (...args) => ipcRenderer.invoke(channel.main.redis.srem, ...args),
		sadd: (...args) => ipcRenderer.invoke(channel.main.redis.sadd, ...args),
		onReady: callback => ipcRenderer.on(channel.main.redis.onReady, (e, ...args) => callback(...args)),
		onError: callback => ipcRenderer.on(channel.main.redis.onError, (e, ...args) => callback(...args)),
		onEnd: callback => ipcRenderer.on(channel.main.redis.onEnd, (e, ...args) => callback(...args)),
		onConnect: callback => ipcRenderer.on(channel.main.redis.onConnect, (e, ...args) => callback(...args)),
		onReconnect: callback => ipcRenderer.on(channel.main.redis.onReconnect, (e, ...args) => callback(...args)),
	},
})

// setting window
contextBridge.exposeInMainWorld('settingWindow', {
	// window operations
	close: () => ipcRenderer.send(channel.setting.close),
	minimize: () => ipcRenderer.send(channel.setting.minimize),
})
