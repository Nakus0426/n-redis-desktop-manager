export const channel = {
	main: {
		// functions
		minimize: 'main:minimize',
		maximize: 'main:maximize',
		unmaximize: 'main:unmaximize',
		openSetting: 'main:openSetting',
		close: 'main:close',
		getAppTheme: 'main:getAppTheme',
		store: {
			size: 'main:storage:size',
			set: 'main:storage:set',
			get: 'main:storage:get',
			remove: 'main:storage:remove',
			clear: 'main:storage:clear',
			key: 'main:storage:key',
		},
		pinia: {
			change: 'main:pinia:change',
			onChange: 'main:pinia:onChange',
		},
		// events
		onMinimize: 'main:onMinimize',
		onMaximize: 'main:onMaximize',
		onUnmaximize: 'main:onUnmaximize',
	},
	setting: {
		// functions
		minimize: 'setting:minimize',
		close: 'setting:close',
	},
}
