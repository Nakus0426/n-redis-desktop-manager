import { createGlobalState, useEventBus } from '@vueuse/core'
import { type SelectOption } from 'tdesign-vue-next'
import { useLoading } from '@/hooks/useLoading'
import { CONNECTIONS_UPDATE_EVENT_KEY } from './keys'

export type Tab = {
	id: string
	key: string
	title: string
	icon?: string
	isConnection: boolean
	isActived?: boolean
}

/** connections tabs hook */
export const useTabs = createGlobalState(() => {
	const activedTab = ref<Tab>(null)
	const tabs = ref<Tab[]>([])

	watch(activedTab, value => {
		tabs.value.forEach(item => (item.isActived = value?.id === item.id && value?.key === item.key))
	})

	useEventBus(CONNECTIONS_UPDATE_EVENT_KEY).on(id => {
		tabs.value.filter(item => item.id === id).forEach(item => removeTab(item.id, item.key))
	})

	function addTab(tab: Tab) {
		tab.icon = tab.isConnection ? 'fluent:database-16-regular' : 'fluent:key-16-regular'
		activedTab.value = tab
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

/** database select hook */
export function useDatabaseSelect(id: string, immidiate = false) {
	const options = ref<SelectOption[]>([])
	const { isLoading, enter, exit } = useLoading()

	async function init() {
		try {
			enter()
			const databases = await window.mainWindow.redis.configGet(id, 'databases')
			const keyspaceStr = await window.mainWindow.redis.info(id, 'keyspace')
			const keyspace = keyspaceStr.split('\n')
			keyspace.shift()
			keyspace.pop()
			const keyCountMap = keyspace.map(item => {
				const [db, count] = item.split(':')
				return { key: Number(db.split('db')[1]), count: Number(count.split('=')[1].split(',')[0]) }
			})
			options.value = Array.from({ length: Number(databases.databases) }, (_, index) => ({
				label: `db${index} (${keyCountMap.find(item => item.key === index)?.count ?? 0})`,
				value: index,
			}))
		} finally {
			exit()
		}
	}

	immidiate && init()

	return { options, isLoading, init }
}

/** get all keys hook */
export function useGetAllKeys(id: string, immidiate = false) {
	const { isLoading, enter, exit } = useLoading()
	const keys = ref<string[]>([])

	async function init() {
		try {
			enter()
			const res = await window.mainWindow.redis.keys(id, '*')
			keys.value = res.sort()
		} finally {
			exit()
		}
	}

	immidiate && init()

	return { keys, isLoading, init }
}
