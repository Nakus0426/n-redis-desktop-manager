export const channel = {
	main: {
		// window operations
		minimize: 'main:minimize',
		maximize: 'main:maximize',
		unmaximize: 'main:unmaximize',
		openSetting: 'main:openSetting',
		close: 'main:close',
		onMinimize: 'main:onMinimize',
		onMaximize: 'main:onMaximize',
		onUnmaximize: 'main:onUnmaximize',
		onError: 'main:onError',
		// app operations
		getAppTheme: 'main:getAppTheme',
		getSystemLocale: 'main:getSystemLocale',
		// pinia operations
		pinia: {
			change: 'main:pinia:change',
			onChange: 'main:pinia:onChange',
		},
		//redis operations
		redis: {
			create: 'main:redis:create',
			connect: 'main:redis:connect',
			disconnect: 'main:redis:disconnect',
			isConnected: 'main:redis:isConnected',
			configGet: 'main:redis:configGet',
			select: 'main:redis:select',
			info: 'main:redis:info',
			keys: 'main:redis:keys',
			set: 'main:redis:set',
			onReady: 'main:redis:onReady',
			onEnd: 'main:redis:onEnd',
			onConnect: 'main:redis:onConnect',
			onReconnect: 'main:redis:onReconnect',
		},
	},
	setting: {
		// window operations
		minimize: 'setting:minimize',
		close: 'setting:close',
	},
}