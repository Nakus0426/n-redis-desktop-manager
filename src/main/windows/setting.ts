import { BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { channel } from './channels'

/**
 * setting window
 */
export class SettingWindow {
	private settingWindow: BrowserWindow

	constructor() {
		this.settingWindow = null
	}

	/**
	 * open setting window
	 */
	open() {
		if (this.settingWindow) {
			this.settingWindow.show()
			return
		}
		this.settingWindow = new BrowserWindow({
			show: false,
			width: 800,
			height: 500,
			center: true,
			resizable: false,
			frame: false,
			title: '设置',
			webPreferences: {
				nodeIntegration: true,
				preload: path.join(__dirname, 'preload.js'),
			},
		})

		this.settingWindow.on('ready-to-show', () => {
			this.settingWindow.show()
		})

		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
			this.settingWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/setting`)
		} else {
			this.settingWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
				hash: '#/setting',
			})
		}

		if (import.meta.env.DEV) this.settingWindow.webContents.openDevTools()

		this.settingWindow.on('closed', e => {
			this.settingWindow = null
		})

		ipcMain.on(channel.setting.minimize, () => {
			if (this.settingWindow) this.settingWindow.minimize()
		})
		ipcMain.on(channel.setting.close, () => {
			if (this.settingWindow) this.settingWindow.close()
		})
	}
}
