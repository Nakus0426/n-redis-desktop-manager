import { type NativeTheme, ipcMain } from 'electron'
const { MicaBrowserWindow, IS_WINDOWS_11 } = require('mica-electron')
import { MicaBrowserWindow as MicaBrowserWindowType } from 'mica-electron'
import path from 'path'
import { channel } from './channels'
import { configStore } from '../configStore'

/**
 * setting window
 */
export class SettingWindow {
	private settingWindow: MicaBrowserWindowType

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
		this.settingWindow = new MicaBrowserWindow({
			icon: './src/assets/icons/logo.ico',
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
		}) as MicaBrowserWindowType

		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
			this.settingWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/setting`)
		} else {
			this.settingWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
				hash: '#/setting',
			})
		}

		this.settingWindow.on('ready-to-show', () => this.settingWindow.show())

		this.initMica()
		this.initAppTheme()

		const unWatchAppTheme = configStore.onDidChange('appTheme', value => this.initAppTheme(value))

		this.settingWindow.on('closed', () => {
			this.settingWindow = null
		})

		ipcMain.on(channel.setting.minimize, () => {
			if (!this.settingWindow) return
			this.settingWindow.minimize()
		})
		ipcMain.on(channel.setting.close, () => {
			if (!this.settingWindow) return
			this.settingWindow.minimize()
			this.settingWindow.close()
			unWatchAppTheme()
		})
	}

	private initMica() {
		if (!IS_WINDOWS_11) return
		const enable = configStore.get('appMicaConfig', false)
		if (enable) this.settingWindow.setMicaEffect()
	}

	private initAppTheme(theme?: NativeTheme['themeSource']) {
		const _theme = theme || configStore.get('appTheme', 'light')
		if (_theme === 'dark') this.settingWindow.setDarkTheme()
		if (_theme === 'light') this.settingWindow.setLightTheme()
		if (_theme === 'system') this.settingWindow.setAutoTheme()
	}
}
