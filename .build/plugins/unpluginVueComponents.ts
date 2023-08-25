import { TDesignResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { ComponentResolver } from 'unplugin-vue-components/types'

/**
 * setup unplugin-vue-components plugin
 */
export function setupUnpluginVueComponents() {
	return Components({
		dts: 'src/components.d.ts',
		globs: ['src/components/**!(modules)/*.vue', 'src/components/*.vue'],
		resolvers: [TDesignResolver({ library: 'vue-next' }), IconifyResolver()],
	})
}

/**
 * resolver of iconify
 */
function IconifyResolver(): ComponentResolver {
	return {
		type: 'component',
		resolve: name => {
			if (name === 'Icon' || name === 'icon') {
				return {
					name: 'Icon',
					from: '@iconify/vue',
				}
			}
		},
	}
}
