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
			set: 'main:redis:set',
		},
	},
	setting: {
		// window operations
		minimize: 'setting:minimize',
		close: 'setting:close',
	},
}
