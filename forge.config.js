export default {
	packagerConfig: {
		asar: true,
		icon: 'public/images/logo',
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				setupIcon: 'src/assets/icons/logo.ico',
			},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-vite',
			config: {
				build: [
					{
						entry: 'src/main/index.ts',
						config: 'vite.main.config.ts',
					},
					{
						entry: 'src/main/preload.ts',
						config: 'vite.preload.config.ts',
					},
				],
				renderer: [
					{
						name: 'main_window',
						config: 'vite.renderer.config.ts',
					},
				],
			},
		},
	],
}
