// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { channel } from './windows/channels'

// main window
contextBridge.exposeInMainWorld('mainWindow', {
	// functions
	minimize: () => ipcRenderer.send(channel.main.minimize),
	maximize: () => ipcRenderer.send(channel.main.maximize),
	unmaximize: () => ipcRenderer.send(channel.main.unmaximize),
	openSettingWindow: () => ipcRenderer.send(channel.main.openSetting),
	close: () => ipcRenderer.send(channel.main.close),
	getAppTheme: () => ipcRenderer.sendSync(channel.main.getAppTheme),
	getSystemLocale: () => ipcRenderer.sendSync(channel.main.getSystemLocale),
	store: {
		size: () => ipcRenderer.sendSync(channel.main.store.size),
		set: (...args) => ipcRenderer.send(channel.main.store.set, ...args),
		get: (...args) => ipcRenderer.sendSync(channel.main.store.get, ...args),
		remove: (...args) => ipcRenderer.send(channel.main.store.remove, ...args),
		clear: () => ipcRenderer.send(channel.main.store.clear),
		key: (...args) => ipcRenderer.sendSync(channel.main.store.key, ...args),
	},
	pinia: {
		change: (...args) => ipcRenderer.send(channel.main.pinia.change, ...args),
		onChange: callback => ipcRenderer.on(channel.main.pinia.onChange, (e, ...args) => callback(...args)),
	},
	// events
	onMinimize: callback => ipcRenderer.on(channel.main.onMinimize, callback),
	onMaximize: callback => ipcRenderer.on(channel.main.onMaximize, callback),
	onUnMaximize: callback => ipcRenderer.on(channel.main.onUnmaximize, callback),
})

// setting window
contextBridge.exposeInMainWorld('settingWindow', {
	// functions
	close: () => ipcRenderer.send(channel.setting.close),
	minimize: () => ipcRenderer.send(channel.setting.minimize),
})
