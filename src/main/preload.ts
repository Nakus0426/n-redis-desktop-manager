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
	onError: callback => ipcRenderer.on(channel.main.onError, (e, ...args) => callback(...args)),
	// app operations
	getAppTheme: () => ipcRenderer.sendSync(channel.main.getAppTheme),
	getSystemLocale: () => ipcRenderer.sendSync(channel.main.getSystemLocale),
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
		isConnected: (...args) => ipcRenderer.sendSync(channel.main.redis.isConnected, ...args),
		set: (...args) => ipcRenderer.invoke(channel.main.redis.set, ...args),
		onReady: callback => ipcRenderer.on(channel.main.redis.onReady, (e, ...args) => callback(...args)),
	},
})

// setting window
contextBridge.exposeInMainWorld('settingWindow', {
	// window operations
	close: () => ipcRenderer.send(channel.setting.close),
	minimize: () => ipcRenderer.send(channel.setting.minimize),
})
