import { type ConfigEnv, type UserConfig, defineConfig, mergeConfig } from 'vite'
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from './vite.base.config'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'build'>
	const { forgeConfigSelf } = forgeEnv
	const define = getBuildDefine(forgeEnv)
	const config: UserConfig = {
		build: {
			lib: {
				entry: forgeConfigSelf.entry!,
				fileName: () => '[name].js',
				formats: ['es'],
			},
			rollupOptions: {
				external,
			},
		},
		plugins: [pluginHotRestart('restart')],
		define,
		resolve: {
			mainFields: ['module', 'jsnext:main', 'jsnext'],
			alias: [{ find: '@', replacement: '/src' }],
		},
	}

	return mergeConfig(getBuildConfig(forgeEnv), config)
})
