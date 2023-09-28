export {}

export interface MainWindow {
	minimize: () => void
	maximize: () => void
	unmaximize: () => void
	openSettingWindow: () => void
	close: () => void
	onMinimize: (callback: () => void) => void
	onMaximize: (callback: () => void) => void
	onUnMaximize: (callback: () => void) => void
	onError: (callback: (error: any) => void) => void
	getAppTheme: () => 'light' | 'dark'
	getSystemLocale: () => string

	pinia: {
		change: (key: string, value: any, isResetVersion: boolean, storeVersion: string) => void
		onChange: (callback: (key: string, value: any, isResetVersion: boolean, storeVersion: string) => void) => void
	}

	redis: {
		create: typeof import('./utils')['RedisUtil']['prototype']['create']
		connect: typeof import('./utils')['RedisUtil']['prototype']['connect']
		disconnect: typeof import('./utils')['RedisUtil']['prototype']['disconnect']
		destory: typeof import('./utils')['RedisUtil']['prototype']['destory']
		isConnected: typeof import('./utils')['RedisUtil']['prototype']['isConnected']
		configGet: typeof import('./utils')['RedisUtil']['prototype']['configGet']
		ping: typeof import('./utils')['RedisUtil']['prototype']['ping']
		select: typeof import('./utils')['RedisUtil']['prototype']['select']
		info: typeof import('./utils')['RedisUtil']['prototype']['info']
		keys: typeof import('./utils')['RedisUtil']['prototype']['keys']
		set: typeof import('./utils')['RedisUtil']['prototype']['set']
		get: typeof import('./utils')['RedisUtil']['prototype']['get']
		del: typeof import('./utils')['RedisUtil']['prototype']['del']
		rename: typeof import('./utils')['RedisUtil']['prototype']['rename']
		exists: typeof import('./utils')['RedisUtil']['prototype']['exists']
		expire: typeof import('./utils')['RedisUtil']['prototype']['expire']
		type: typeof import('./utils')['RedisUtil']['prototype']['type']
		ttl: typeof import('./utils')['RedisUtil']['prototype']['ttl']
		onError: (callback: (id: string, error: Error) => void) => void
		onReady: (callback: (id: string) => void) => void
		onEnd: (callback: (id: string) => void) => void
		onConnect: (callback: (id: string) => void) => void
		onReconnect: (callback: (id: string) => void) => void
	}
}

export interface SettingWindow {
	minimize: () => void
	close: () => void
}

export as namespace ElectronAPI
