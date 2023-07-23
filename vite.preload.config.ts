import { defineConfig } from 'vite'
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
})
