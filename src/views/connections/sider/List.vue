<template>
	<div class="sider-list" ref="containerRef">
		<div class="header">
			<div class="header_row">
				<TSelect
					v-model="activedDatabase"
					:options="databaseOptions"
					:loading="databasesLoading"
					size="small"
					@change="initKeys()"
				>
					<template #prefixIcon>
						<Icon height="16" width="16" icon="fluent:database-stack-16-regular" />
					</template>
					<template #panelTopContent>
						<div class="database_panel_top">
							<TButton
								size="small"
								block
								theme="default"
								variant="text"
								:loading="databasesLoading"
								@click="initDatabaseOptions()"
							>
								<template #icon>
									<Icon height="16" width="16" icon="fluent:arrow-sync-16-regular" />
								</template>
								<span>刷新</span>
							</TButton>
						</div>
					</template>
				</TSelect>
				<TTooltip content="刷新" :show-arrow="false">
					<TButton size="small" theme="default" variant="outline" @click="initKeys()">
						<template #icon><Icon height="16" width="16" icon="fluent:arrow-sync-16-regular" /></template>
					</TButton>
				</TTooltip>
				<TTooltip content="新增" :show-arrow="false">
					<TButton size="small" theme="default" variant="outline">
						<template #icon><Icon height="16" width="16" icon="fluent:add-16-regular" /></template>
					</TButton>
				</TTooltip>
			</div>
			<div class="header_row">
				<TInput size="small" placeholder="搜索" clearable v-model="filterKeyword">
					<template #prefixIcon><Icon height="16" width="16" icon="fluent:search-16-regular" /></template>
				</TInput>
			</div>
		</div>
		<TSkeleton animation="gradient" :loading="keysLoading" :row-col="skeletonRowCol">
			<div class="body">
				<div
					class="body_item"
					:class="keyActivedClass(item)"
					v-for="item in filterKeysList"
					:key="item"
					:title="item"
					@click="handleKeyClick(item)"
				>
					<Icon height="16" width="16" icon="fluent:key-16-regular" />
					<div class="body_item_label">{{ item }}</div>
				</div>
			</div>
			<Empty class="body-empty" icon="nothingHere" description="暂无数据" v-show="isEmpty" />
		</TSkeleton>
	</div>
	<BackTop :target="containerRef" size="small" offset="large" />
</template>

<script setup lang="ts">
import { type SelectOption, type SkeletonRowCol } from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { useConnectionsStore, type Connection } from '@/store'
import { connectionConnectedEventKey, keyActivedEventKey, tabActivedEventKey } from '../keys'
import { useLoading, useScrollbar } from '@/hooks'

defineOptions({ name: 'SiderList' })

const props = defineProps<{ connection: Connection }>()
const emit = defineEmits<{ (event: 'error', id: string) }>()

const connectionsStore = useConnectionsStore()

const skeletonRowCol: SkeletonRowCol = [1, 1, 1, 1, 1, 1]

// init scrollbar
const containerRef = ref(null)
const { init: initScrollbar } = useScrollbar(containerRef)

onMounted(() => nextTick(() => initScrollbar()))

// is keys empty
const isEmpty = computed(() => filterKeysList.value.length === 0)

// init data
const loading = ref(false)
async function init() {
	try {
		loading.value = true
		await connectionsStore.connectConnection(props.connection.id)
		useEventBus(connectionConnectedEventKey).emit(props.connection)
		await initDatabaseOptions()
		await initKeys()
	} catch (error) {
		emit('error', props.connection.id)
	} finally {
		loading.value = false
	}
}
onMounted(() => init())

// init database
const { isLoading: databasesLoading, enter: enterDatabaseLoading, exit: exitDatabaseLoading } = useLoading()
const databaseOptions = ref<SelectOption[]>([])
const activedDatabase = ref(0)
async function initDatabaseOptions() {
	try {
		enterDatabaseLoading()
		const databases = await window.mainWindow.redis.configGet(props.connection.id, 'databases')
		const keyspaceStr = await window.mainWindow.redis.info(props.connection.id, 'keyspace')
		const keyspace = keyspaceStr.split('\n')
		keyspace.shift()
		keyspace.pop()
		const keyCountMap = keyspace.map(item => {
			const [db, count] = item.split(':')
			return { key: Number(db.split('db')[1]), count: Number(count.split('=')[1].split(',')[0]) }
		})
		const options = Array.from({ length: Number(databases.databases) }, (_, index) => ({
			label: `db${index} (${keyCountMap.find(item => item.key === index)?.count ?? 0})`,
			value: index,
		}))
		databaseOptions.value = options
	} finally {
		exitDatabaseLoading()
	}
}

// init keys
const { isLoading: keysLoading, enter: enterKeysLoading, exit: exitKeysLoading } = useLoading()
const keysList = ref<any[]>([])
async function initKeys() {
	try {
		enterKeysLoading()
		await window.mainWindow.redis.select(props.connection.id, activedDatabase.value)
		const keys = await window.mainWindow.redis.keys(props.connection.id, '*')
		keysList.value = []
		nextTick(() => (keysList.value = keys.sort()))
	} finally {
		exitKeysLoading()
	}
}

// key list filter
const filterKeyword = ref<string>()
const filterKeysList = computed(() => {
	if (!filterKeyword.value) return keysList.value
	return keysList.value.filter(key => key.includes(filterKeyword.value))
})

// key click
const activedKey = ref<string>()
function handleKeyClick(key: string) {
	activedKey.value = key
	useEventBus(keyActivedEventKey).emit(key)
}

// generate key actived class
function keyActivedClass(key: string) {
	return activedKey.value === key ? 'is-actived' : ''
}

// tab actived
useEventBus(tabActivedEventKey).on(key => {
	activedKey.value = key
})
</script>

<style scoped lang="scss">
.sider-list {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-m);
	min-height: 60px;
	max-height: calc(100vh - 150px);
}

.header {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);

	&_row {
		display: flex;
		gap: var(--td-comp-margin-s);
	}

	:global(.database_panel_top) {
		position: sticky;
		top: 0;
		padding: var(--td-comp-paddingLR-xs);
		border-bottom: 1px solid var(--td-component-stroke);
		background-color: var(--td-bg-color-container);
		z-index: 1;
	}
}

.body {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);

	&_item {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		border-radius: var(--td-radius-default);
		font: var(--td-font-body-medium);
		color: var(--td-text-color-primary);
		padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-xs);
		transition: all var(--td-transition);
		cursor: pointer;

		&.is-actived {
			background-color: var(--td-brand-color-light);
		}

		&:not(.is-actived):hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&_label {
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	&-empty {
		padding: var(--td-comp-paddingTB-m) 0;
	}
}
</style>
