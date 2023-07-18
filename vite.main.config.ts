import { defineConfig } from 'vite'
import { resolve } from 'path'

function pathResolve(dir: string) {
	return resolve(process.cwd(), '.', dir)
}

export default defineConfig({
	build: {
		rollupOptions: {
			external: ['serialport', 'sqlite3'],
		},
	},
	resolve: {
		alias: [
			// @/xxxx => src/xxxx
			{ find: '@', replacement: pathResolve('src') + '/' },
		],
		browserField: false,
		mainFields: ['module', 'jsnext:main', 'jsnext'],
	},
})
