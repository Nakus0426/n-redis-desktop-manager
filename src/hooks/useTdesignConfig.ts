import { type GlobalConfigProvider } from 'tdesign-vue-next'
import zhCNConfig from 'tdesign-vue-next/es/locale/zh_CN'
import zhTWConfig from 'tdesign-vue-next/es/locale/zh_TW'
import { merge } from 'lodash-es'
import { tdesignConfig } from '@/config'
import { useAppStore } from '@/store'

const localeConfigMap = {
	'zh-CN': zhCNConfig,
	'zh-TW': zhTWConfig,
}

export function useTdesignConfig() {
	const config = ref<GlobalConfigProvider>({})
	const appStore = useAppStore()

	watch(
		() => appStore.locale,
		value => {
			config.value = merge(localeConfigMap[value], tdesignConfig)
		},
		{ immediate: true }
	)

	return { config }
}
