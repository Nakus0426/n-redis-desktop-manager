// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

// main window
contextBridge.exposeInMainWorld('mainWindow', {
	minimize: () => ipcRenderer.send('minimizeMainWindow'),
	maximize: () => ipcRenderer.send('maximizeMainWindow'),
	unmaximize: () => ipcRenderer.send('unmaximizeMainWindow'),
	onMinimize: callback => ipcRenderer.on('onMainWindowMinimize', callback),
	onMaximize: callback => ipcRenderer.on('onMainWindowMaximize', callback),
	onUnMaximize: callback => ipcRenderer.on('onMainWindowUnMaximize', callback),
	createChildWindow: args => ipcRenderer.send('createChildWindow', args),
})
