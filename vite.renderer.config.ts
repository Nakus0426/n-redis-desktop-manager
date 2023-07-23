import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { setupUnpluginAutoImport, setupUnpluginVueComonents, setupUnpluginVueI18n, setupVue } from './.build/plugins'
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
		setupUnpluginVueComonents(),
		vueJsx(),
		setupUnpluginVueI18n(),
	],
})
