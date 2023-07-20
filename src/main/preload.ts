// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

// main window
contextBridge.exposeInMainWorld('mainWindow', {
	minimize: () => ipcRenderer.send('minimizeMainWindow'),
	maximize: () => ipcRenderer.send('maximizeMainWindow'),
	unmaximize: () => ipcRenderer.send('unmaximizeMainWindow'),
	openSettingWindow: () => ipcRenderer.send('openSettingWindow'),
	close: () => ipcRenderer.send('closeMainWindow'),
	onMinimize: callback => ipcRenderer.on('onMainWindowMinimize', callback),
	onMaximize: callback => ipcRenderer.on('onMainWindowMaximize', callback),
	onUnMaximize: callback => ipcRenderer.on('onMainWindowUnMaximize', callback),
})

// setting window
contextBridge.exposeInMainWorld('settingWindow', {
	close: () => ipcRenderer.send('closeSettingWindow'),
	minimize: () => ipcRenderer.send('minimizeSettingWindow'),
})
