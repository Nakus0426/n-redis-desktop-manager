import { createGlobalState } from '@vueuse/core'

export type Tab = {
	id: string
	key: string
	title: string
	icon: string
	isConnection: boolean
	isActived: boolean
}

/** connections tabs hook */
export const useTabs = createGlobalState(() => {
	const activedTab = ref<Tab>()
	const tabs = ref<Tab[]>([])

	watch(activedTab.value, value =>
		tabs.value.forEach(item => (item.isActived = value.id === item.id && value.key === item.key)),
	)

	function addTab(tab: Tab) {
		if (tabs.value.some(item => item.id === tab.id && item.key === item.key)) {
			activedTab.value = tab
			return
		}
		tabs.value.push(tab)
	}

	function removeTab(id: string, key: string) {
		const index = tabs.value.findIndex(item => item.id === id && item.key === key)
		if (index < 0) return
		if (activedTab.value.id === id && activedTab.value.key === key && tabs.value.length > 1) {
			const prefix = tabs.value?.[index - 1]
			const suffix = tabs.value?.[index + 1]
			activedTab.value = prefix || suffix
		}
		if (tabs.value.length === 1) activedTab.value = null
		tabs.value.splice(index, 1)
	}

	return { activedTab, tabs, addTab, removeTab }
})
