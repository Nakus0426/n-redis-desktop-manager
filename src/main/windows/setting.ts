import { ipcMain, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'path'
import { Channels } from './channels'
import { configStore } from '../configStore'

class SettingWindow {
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
			width: 800,
			height: 500,
			center: true,
			resizable: false,
			frame: false,
			title: '设置',
			backgroundMaterial: configStore.get('mica') ? 'mica' : 'auto',
			webPreferences: {
				nodeIntegration: true,
				preload: join(__dirname, 'preload.js'),
			},
		})
		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) this.instance.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/setting`)
		else
			this.instance.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), { hash: '#/setting' })
		this.setupEvents()
		this.setupIpc()
	}

	/** setup window event */
	private setupEvents() {
		this.instance.on('ready-to-show', () => this.instance.show())
		this.instance.on('closed', () => (this.instance = null))
	}

	/** setup window ipc */
	private setupIpc() {
		ipcMain.on(Channels.Setting.minimize, () => {
			if (this.instance) this.instance.minimize()
		})
		ipcMain.on(Channels.Setting.close, () => {
			if (this.instance) this.instance.close()
		})
		ipcMain.on(Channels.Setting.openDevtools, () => {
			if (this.instance) this.instance.webContents.openDevTools()
		})
		ipcMain.on(Channels.Setting.reload, () => {
			if (this.instance) this.instance.reload()
		})
	}
}

export const settingWindow = new SettingWindow()
