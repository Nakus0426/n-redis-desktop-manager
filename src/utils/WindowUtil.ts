import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { merge } from 'lodash-es'
import path from 'path'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

export interface CreateChildWindowOptions {
	width?: number
	height?: number
	minWidth?: number
	minHeight?: number
	center?: boolean
	title?: string
	multiple?: boolean
	path: string
}

type Window = BrowserWindow & {
	multiple?: boolean
}

const defaultOptions: CreateChildWindowOptions = {
	width: 640,
	height: 400,
	minWidth: 320,
	minHeight: 200,
	center: true,
	title: '',
	multiple: false,
	path: '',
}

/**
 * multiple windows util
 */
export class WindowUtil {
	private readonly windows: Record<string, Window>

	constructor() {
		this.windows = {}
	}

	/**
	 * create a child window
	 * @param options window options
	 */
	create(parent: BrowserWindow, options?: CreateChildWindowOptions) {
		const { width, height, minWidth, minHeight, center, path: windowPath, multiple } = merge(defaultOptions, options)

		for (const key in this.windows) {
			const currentWindow = this.windows[key]
			if (key === windowPath && !currentWindow.multiple) {
				currentWindow.focus()
				return
			}
		}

		const windowOptions: BrowserWindowConstructorOptions = {
			width,
			height,
			minWidth,
			minHeight,
			center,
			frame: false,
			show: false,
			parent,
			webPreferences: {
				nodeIntegration: true,
			},
		}

		const window = new BrowserWindow(windowOptions)

		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
			window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#${windowPath}`)
		} else {
			window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html/#${windowPath}`))
		}

		window.on('ready-to-show', () => {
			window.show()
		})

		if (import.meta.env.DEV) window.webContents.openDevTools()

		this.windows[windowPath] = window
		this.windows[windowPath].multiple = multiple
	}
}
