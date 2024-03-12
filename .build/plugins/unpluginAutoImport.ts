import AutoImport from 'unplugin-auto-import/vite'

/**
 * setup unplugin-auto-import plugin
 */
export function setupUnpluginAutoImport() {
	return AutoImport({
		dts: 'src/z-auto-imports.d.ts',
		imports: [
			'vue',
			'vue-router',
			{
				'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
			},
		],
		vueTemplate: true,
	})
}
