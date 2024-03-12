import { type ConfigEnv, defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'
import {
	setupUnpluginAutoImport,
	setupUnpluginVueComponents,
	setupUnpluginVueI18n,
	setupVue,
	setupVueDevtools,
} from './.build/plugins'
import { pluginExposeRenderer } from './vite.base.config'

export default defineConfig(env => {
	const forgeEnv = env as ConfigEnv<'renderer'>
	const { root, mode, forgeConfigSelf } = forgeEnv
	const name = forgeConfigSelf.name ?? ''

	return {
		root,
		mode,
		clearScreen: false,
		resolve: {
			preserveSymlinks: true,
			alias: [{ find: '@', replacement: '/src' }],
		},
		build: {
			outDir: `.vite/renderer/${name}`,
			cssMinify: 'lightningcss',
		},
		css: {
			transformer: 'lightningcss',
			lightningcss: {
				targets: browserslistToTargets(browserslist('>= 0.25%')),
			},
		},
		plugins: [
			setupVue(),
			setupUnpluginAutoImport(),
			setupUnpluginVueComponents(),
			vueJsx(),
			setupUnpluginVueI18n(),
			setupVueDevtools(),
			pluginExposeRenderer(name),
		],
	}
})
