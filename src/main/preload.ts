// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

// main window
contextBridge.exposeInMainWorld('mainWindow', {
	minimize: () => ipcRenderer.send('minimizeMainWindow'),
	maximize: () => ipcRenderer.send('maximizeMainWindow'),
	unmaximize: () => ipcRenderer.send('unmaximizeMainWindow'),
	onMinimize: (callback: () => void) => ipcRenderer.on('onMainWindowMinimize', callback),
	onMaximize: (callback: () => void) => ipcRenderer.on('onMainWindowMaximize', callback),
	onUnMaximize: (callback: () => void) => ipcRenderer.on('onMainWindowUnMaximize', callback),
})
