import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {
	setupUnpluginAutoImport,
	setupUnpluginVueComponents,
	setupUnpluginVueI18n,
	setupVue,
	setupVueDevtools,
} from './.build/plugins'
import { resolve } from 'path'

function pathResolve(dir: string) {
	return resolve(process.cwd(), '.', dir)
}

export default defineConfig({
	resolve: {
		alias: [
			// @/xxxx => src/xxxx
			{ find: '@', replacement: pathResolve('src') + '/' },
		],
	},
	plugins: [
		setupVue(),
		setupUnpluginAutoImport(),
		setupUnpluginVueComponents(),
		vueJsx(),
		setupUnpluginVueI18n(),
		setupVueDevtools(),
	],
})
