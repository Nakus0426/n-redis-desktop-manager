<template>
	<div class="sider-tree" ref="containerRef">
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
						<Icon height="14" width="14" icon="fluent:database-stack-16-regular" />
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
						<template #icon><Icon height="16" width="16" icon="fluent:arrow-sync-20-regular" /></template>
					</TButton>
				</TTooltip>
				<TTooltip content="新增" :show-arrow="false">
					<TButton size="small" theme="default" variant="outline">
						<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
					</TButton>
				</TTooltip>
			</div>
			<div class="header_row">
				<TInput size="small" placeholder="搜索" clearable @change="handleKeysTreeFilterChange">
					<template #prefixIcon><Icon height="14" width="14" icon="fluent:search-20-regular" /></template>
				</TInput>
			</div>
		</div>
		<TSkeleton animation="gradient" :loading="keysLoading" :row-col="skeletonRowCol">
			<TTree
				:data="keysTree"
				:filter="keysTreeFilter"
				v-model:actived="activedKey"
				allow-fold-node-on-filter
				activable
				expand-mutex
				expand-on-click-node
				hover
				line
				check-strictly
				@active="handleKeyTreeChange"
			>
				<template #label="{ node }">
					<div class="tree_node">
						<Icon height="16" width="16" icon="fluent:key-20-regular" v-if="node.data.isLeaf" />
						<div class="tree_node_label">{{ node.label }}</div>
					</div>
				</template>
				<template #empty>
					<Empty class="header-empty" icon="nothingHere" description="暂无数据" />
				</template>
			</TTree>
		</TSkeleton>
	</div>
	<BackTop :target="containerRef" size="small" offset="large" />
</template>

<script setup lang="ts">
import { type TreeNodeModel, type SelectOption, type TreeNodeValue, type SkeletonRowCol } from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { useConnectionsStore, type Connection } from '@/store'
import { useLoading, useScrollbar } from '@/hooks'
import { connectionConnectedEventKey, keyActivedEventKey, tabActivedEventKey } from '../keys'
import { useKeyTree } from '../hooks'

defineOptions({ name: 'SiderTree' })

const props = defineProps<{ connection: Connection }>()
const emit = defineEmits<{ (event: 'error', id: string) }>()

const connectionsStore = useConnectionsStore()

// init scrollbar
const containerRef = ref()
const { init: initScrollbar } = useScrollbar(containerRef)
onMounted(() => nextTick(() => initScrollbar()))

const skeletonRowCol: SkeletonRowCol = [
	1,
	{ width: '80%', marginLeft: '20%' },
	{ width: '60%', marginLeft: '40%' },
	1,
	{ width: '80%', marginLeft: '20%' },
	{ width: '60%', marginLeft: '40%' },
]

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
const keysTree = ref<any[]>()
async function initKeys() {
	try {
		enterKeysLoading()
		await window.mainWindow.redis.select(props.connection.id, activedDatabase.value)
		const keys = await window.mainWindow.redis.keys(props.connection.id, '*')
		const tree = useKeyTree(keys, props.connection.separator)
		keysTree.value = []
		nextTick(() => (keysTree.value = tree))
	} finally {
		exitKeysLoading()
	}
}

// keys tree keyword filter change
const keysTreeFilter = ref<(node: TreeNodeModel) => boolean>()
function handleKeysTreeFilterChange(value: string) {
	keysTreeFilter.value = node => node.label.includes(value)
}

// connection keys tree change
const activedKey = ref<TreeNodeValue[]>()
function handleKeyTreeChange(value: TreeNodeValue[], { node }: { node: TreeNodeModel }) {
	if (!node.data.isLeaf) return
	if (value.length !== 0) activedKey.value = value
	useEventBus(keyActivedEventKey).emit(node.value as string)
}

// tab actived
useEventBus(tabActivedEventKey).on(key => {
	activedKey.value = [key]
})
</script>

<style scoped lang="scss">
.sider-tree {
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
	&-empty {
		padding: var(--td-comp-paddingTB-m) 0;
	}

	.tree_node {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		color: var(--td-text-color-primary);

		&_label {
			flex: 1;
			font: var(--td-font-body-medium);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}
</style>
