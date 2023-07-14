import { defineConfig } from 'vite'
import { setupUnpluginAutoImport, setupUnpluginVueComonents, setupVue } from './.build/plugins'
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
	plugins: [setupVue(), setupUnpluginAutoImport(), setupUnpluginVueComonents()],
})
