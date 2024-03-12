import { type ConfigEnv, type UserConfig, defineConfig, mergeConfig } from 'vite'
import { getBuildConfig, external, pluginHotRestart } from './vite.base.config'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'build'>
	const { forgeConfigSelf } = forgeEnv
	const config: UserConfig = {
		resolve: {
			alias: [{ find: '@', replacement: '/src' }],
		},
		build: {
			rollupOptions: {
				external,
				input: forgeConfigSelf.entry!,
				output: {
					format: 'cjs',
					inlineDynamicImports: true,
					entryFileNames: '[name].cjs',
					chunkFileNames: '[name].cjs',
					assetFileNames: '[name].[ext]',
				},
			},
		},
		plugins: [pluginHotRestart('reload')],
	}

	return mergeConfig(getBuildConfig(forgeEnv), config)
})
