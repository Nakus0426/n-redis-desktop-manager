// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { channel } from './windows/channels'

// main window
contextBridge.exposeInMainWorld('mainWindow', {
	// window operations
	minimize: () => ipcRenderer.send(channel.main.minimize),
	maximize: () => ipcRenderer.send(channel.main.maximize),
	unmaximize: () => ipcRenderer.send(channel.main.unmaximize),
	openSettingWindow: () => ipcRenderer.send(channel.main.openSetting),
	close: () => ipcRenderer.send(channel.main.close),
	onMinimize: callback => ipcRenderer.on(channel.main.onMinimize, callback),
	onMaximize: callback => ipcRenderer.on(channel.main.onMaximize, callback),
	onUnMaximize: callback => ipcRenderer.on(channel.main.onUnmaximize, callback),
	// app operations
	getAppTheme: () => ipcRenderer.sendSync(channel.main.getAppTheme),
	getSystemLocale: () => ipcRenderer.sendSync(channel.main.getSystemLocale),
	// storage operations
	store: {
		size: () => ipcRenderer.sendSync(channel.main.store.size),
		set: (...args) => ipcRenderer.send(channel.main.store.set, ...args),
		get: (...args) => ipcRenderer.sendSync(channel.main.store.get, ...args),
		remove: (...args) => ipcRenderer.send(channel.main.store.remove, ...args),
		clear: () => ipcRenderer.send(channel.main.store.clear),
		key: (...args) => ipcRenderer.sendSync(channel.main.store.key, ...args),
	},
	// pinia operations
	pinia: {
		change: (...args) => ipcRenderer.send(channel.main.pinia.change, ...args),
		onChange: callback => ipcRenderer.on(channel.main.pinia.onChange, (e, ...args) => callback(...args)),
	},
	// redis operations
	redis: {
		create: (...args) => ipcRenderer.send(channel.main.redis.create, ...args),
		connect: (...args) => ipcRenderer.send(channel.main.redis.connect, ...args),
		set: (...args) => ipcRenderer.send(channel.main.redis.set, ...args),
	},
})

// setting window
contextBridge.exposeInMainWorld('settingWindow', {
	// window operations
	close: () => ipcRenderer.send(channel.setting.close),
	minimize: () => ipcRenderer.send(channel.setting.minimize),
})
