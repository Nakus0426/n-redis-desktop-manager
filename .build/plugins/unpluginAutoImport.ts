import AutoImport from 'unplugin-auto-import/vite'
import { TDesignResolver } from 'unplugin-vue-components/resolvers'

/**
 * setup unplugin-auto-import plugin
 */
export function setupUnpluginAutoImport() {
	return AutoImport({
		dts: 'src/z-auto-imports.d.ts',
		imports: ['vue', 'vue-router'],
		vueTemplate: true,
		resolvers: [TDesignResolver({ library: 'vue-next' })],
	})
}
