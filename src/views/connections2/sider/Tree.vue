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
					<template #prefixIcon><Icon height="14" width="14" icon="fluent:database-stack-16-regular" /></template>
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
								<template #icon><Icon height="16" width="16" icon="fluent:arrow-sync-16-regular" /></template>
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
				allow-fold-node-on-filter
				activable
				expand-mutex
				expand-on-click-node
				hover
				line
				check-strictly
				ref="treeRef"
				@active="handleKeyTreeChange"
			>
				<template #label="{ node }">
					<div class="tree_node">
						<Icon
							height="16"
							width="16"
							color="var(--td-brand-color)"
							icon="fluent:key-20-regular"
							v-if="node.data.isLeaf"
						/>
						<div class="tree_node_label">{{ node.label }}</div>
						<TDropdown trigger="hover">
							<Icon class="tree_node_action" height="16" width="16" icon="fluent:more-vertical-16-regular" />
							<TDropdownMenu>
								<TDropdownItem theme="error" @click="handleKeyRemoveClick(node)">
									<template #prefixIcon><Icon height="16" width="16" icon="fluent:delete-16-regular" /></template>
									<span>删除</span>
								</TDropdownItem>
							</TDropdownMenu>
						</TDropdown>
					</div>
				</template>
				<template #empty>
					<div class="body_empty" v-show="isEmpty">
						<Icon class="body_empty_icon" height="64" width="64" icon="custom-empty" />
						<div class="body_empty_desc">暂无数据</div>
					</div>
				</template>
			</TTree>
		</TSkeleton>
	</div>
	<BackTop :target="containerRef" size="small" offset="large" />
</template>

<script setup lang="ts">
import {
	type TreeNodeModel,
	type SelectOption,
	type TreeNodeValue,
	type SkeletonRowCol,
	Tree,
	MessagePlugin,
	DialogPlugin,
} from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { useConnectionsStore, type Connection } from '@/store'
import { useLoading, useScrollbar } from '@/hooks'
import {
	activedKeyInjectKey,
	connectionConnectedEventKey,
	keyActivedEventKey,
	keyRemovedEventKey,
	keyRenamedEventKey,
	keySavedEventKey,
	keyUpdatedEventKey,
} from '../keys'
import { useKeyRemove, useKeyTree, useKeyTreeSearch } from '../hooks'

const props = defineProps<{ connection: Connection }>()
const emit = defineEmits<{ error: [id: string] }>()

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

// is keys empty
const isEmpty = computed(() => !loading.value && keysTree.value?.length === 0)

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

// key changed
useEventBus(keyRemovedEventKey).on(key => initKeys(false))
useEventBus(keySavedEventKey).on(key => initKeys(false))
useEventBus(keyUpdatedEventKey).on(key => initKeys(false))
useEventBus(keyRenamedEventKey).on(key => initKeys(false))

// init keys
const { isLoading: keysLoading, enter: enterKeysLoading, exit: exitKeysLoading } = useLoading()
const keysTree = ref<any[]>()
async function initKeys(showLoading = true) {
	try {
		showLoading && enterKeysLoading()
		await window.mainWindow.redis.select(props.connection.id, activedDatabase.value)
		const keys = await window.mainWindow.redis.keys(props.connection.id, '*')
		const tree = useKeyTree(keys, props.connection.separator)
		keysTree.value = []
		nextTick(() => (keysTree.value = tree))
	} finally {
		showLoading && exitKeysLoading()
	}
}

// keys tree keyword filter change
const keysTreeFilter = ref<(node: TreeNodeModel) => boolean>()
function handleKeysTreeFilterChange(value: string) {
	keysTreeFilter.value = node => node.label.includes(value)
}

// connection keys tree change
const injectActivedKey = inject(activedKeyInjectKey)
const treeRef = ref<InstanceType<typeof Tree>>()
watch(
	() => injectActivedKey.value?.key,
	newValue => {
		const node = useKeyTreeSearch(keysTree.value, newValue)
		if (node) treeRef.value.setItem(node.value, { actived: true })
	},
)
async function handleKeyTreeChange(value: TreeNodeValue[], { node }: { node: TreeNodeModel }) {
	if (!node.data.isLeaf) return
	const key = node.data.key
	const id = props.connection.id
	const keyExists = await window.mainWindow.redis.exists(id, key)
	if (keyExists !== 1) {
		MessagePlugin.error('键不存在')
		return
	}
	useEventBus(keyActivedEventKey).emit({ key, id })
}

// key remove
const { isLoading: isKeyRemoveLoading, execute: removeKey } = useKeyRemove(props.connection.id)
function handleKeyRemoveClick(node: TreeNodeModel) {
	const dialogInstance = DialogPlugin.confirm({
		header: '删除确认',
		theme: 'danger',
		body: node.data.isLeaf ? '确认删除该键吗？' : '确认删除该目录下的所有键吗？',
		confirmBtn: { loading: isKeyRemoveLoading.value, theme: 'danger', variant: 'outline' },
		onConfirm: async () => {
			dialogInstance.destroy()
		},
	})
}

defineExpose({ init })
</script>

<style scoped lang="scss">
.sider-tree {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-m);
	height: 100%;
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
	&_empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--td-comp-margin-m);
		padding: var(--td-comp-margin-xxl) 0;

		&_icon {
			color: var(--td-bg-color-secondarycomponent);
		}

		&_desc {
			color: var(--td-text-color-placeholder);
			font: var(--td-font-body-small);
		}
	}

	.tree_node {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		color: var(--td-text-color-primary);

		&:hover .tree_node_action {
			visibility: visible;
			opacity: 1;
		}

		&_label {
			flex: 1;
			font: var(--td-font-body-medium);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&_action {
			transition: all var(--td-transition);
			visibility: hidden;
			opacity: 0;
		}
	}
}
</style>
