import { type NativeTheme, ipcMain } from 'electron'
const { MicaBrowserWindow, IS_WINDOWS_11 } = require('mica-electron')
import { MicaBrowserWindow as MicaBrowserWindowType } from 'mica-electron'
import path from 'path'
import { channel } from './channels'
import { configStore } from '../configStore'

/** setting window */
export class SettingWindow {
	private static instance: MicaBrowserWindowType = null

	private constructor() {}

	/** open setting window */
	static open() {
		if (SettingWindow.instance) {
			SettingWindow.instance.show()
			return SettingWindow.instance
		}

		SettingWindow.instance = new MicaBrowserWindow({
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
			SettingWindow.instance.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#/setting`)
		} else {
			SettingWindow.instance.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`), {
				hash: '#/setting',
			})
		}

		SettingWindow.instance.on('ready-to-show', () => SettingWindow.instance.show())

		initMica()
		initAppTheme()

		const unWatchAppTheme = configStore.onDidChange('appTheme', value => initAppTheme(value))

		SettingWindow.instance.on('closed', () => {
			SettingWindow.instance = null
		})

		// window operations
		ipcMain.on(channel.setting.minimize, () => {
			if (!SettingWindow.instance) return
			SettingWindow.instance.minimize()
		})
		ipcMain.on(channel.setting.close, () => {
			if (!SettingWindow.instance) return
			SettingWindow.instance.minimize()
			SettingWindow.instance.close()
			SettingWindow.instance = null
			unWatchAppTheme()
		})
		ipcMain.on(channel.setting.openDevtools, () => {
			if (!SettingWindow.instance) return
			SettingWindow.instance.webContents.openDevTools()
		})
		ipcMain.on(channel.setting.reload, () => {
			if (!SettingWindow.instance) return
			SettingWindow.instance.reload()
		})

		function initMica() {
			if (!IS_WINDOWS_11) return
			const enable = configStore.get('appMicaConfig', false)
			if (enable) SettingWindow.instance.setMicaEffect()
		}

		function initAppTheme(theme?: NativeTheme['themeSource']) {
			const _theme = theme || configStore.get('appTheme', 'light')
			if (_theme === 'dark') SettingWindow.instance.setDarkTheme()
			if (_theme === 'light') SettingWindow.instance.setLightTheme()
			if (_theme === 'system') SettingWindow.instance.setAutoTheme()
		}

		return SettingWindow.instance
	}
}
