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
					<template #prefixIcon><Icon height="16" width="16" icon="fluent:database-stack-16-regular" /></template>
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
					:id="item"
					v-for="item in filterKeysList"
					:key="item"
					@click="handleKeyClick(item)"
				>
					<Icon height="16" width="16" color="var(--td-brand-color)" icon="fluent:key-16-regular" />
					<div class="body_item_label" :title="item">{{ item }}</div>
					<TDropdown trigger="hover">
						<Icon class="body_item_action" height="16" width="16" icon="fluent:more-vertical-16-regular" />
						<TDropdownMenu>
							<TDropdownItem theme="error" @click="handleKeyRemoveClick(item)">
								<template #prefixIcon><Icon height="16" width="16" icon="fluent:delete-16-regular" /></template>
								<span>删除</span>
							</TDropdownItem>
						</TDropdownMenu>
					</TDropdown>
				</div>
				<div class="body_empty" v-if="isEmpty">
					<Icon class="body_empty_icon" height="64" width="64" icon="custom-empty" />
					<div class="body_empty_desc">暂无数据</div>
				</div>
			</div>
		</TSkeleton>
	</div>
	<BackTop :target="containerRef" size="small" offset="large" />
</template>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin, type SelectOption, type SkeletonRowCol } from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { useConnectionsStore, type Connection } from '@/store'
import {
	activedKeyInjectKey,
	connectionConnectedEventKey,
	keyActivedEventKey,
	keyRemovedEventKey,
	keyRenamedEventKey,
	keySavedEventKey,
	keyUpdatedEventKey,
} from '../keys'
import { useLoading, useScrollbar } from '@/hooks'
import { useKeyRemove } from '../hooks'

defineOptions({ name: 'SiderList' })

const props = defineProps<{ connection: Connection }>()

const emit = defineEmits<{ error: [id: string] }>()

const connectionsStore = useConnectionsStore()

const skeletonRowCol: SkeletonRowCol = [1, 1, 1, 1, 1, 1]

// init scrollbar
const containerRef = ref(null)
const { init: initScrollbar } = useScrollbar(containerRef)
onMounted(() => nextTick(() => initScrollbar()))

// is keys empty
const isEmpty = computed(() => !loading.value && filterKeysList.value.length === 0)

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
const keysList = ref<string[]>([])
async function initKeys(showLoading = true) {
	try {
		showLoading && enterKeysLoading()
		await window.mainWindow.redis.select(props.connection.id, activedDatabase.value)
		const keys = await window.mainWindow.redis.keys(props.connection.id, '*')
		keysList.value = []
		nextTick(() => {
			keysList.value = keys.sort()
		})
	} finally {
		showLoading && exitKeysLoading()
	}
}

// key list filter
const filterKeyword = ref<string>()
const filterKeysList = computed(() => {
	if (!filterKeyword.value) return keysList.value
	return keysList.value.filter(key => key.includes(filterKeyword.value))
})

// key click
const activedKey = inject(activedKeyInjectKey)
function handleKeyClick(key: string) {
	useEventBus(keyActivedEventKey).emit({ key, id: props.connection.id })
}

// generate key actived class
function keyActivedClass(key: string) {
	return activedKey.value?.key === key ? 'is-actived' : ''
}

// key remove click
const { isLoading: isKeyRemoveLoading, execute: removeKey } = useKeyRemove(props.connection.id)
function handleKeyRemoveClick(key: string) {
	const dialogInstance = DialogPlugin.confirm({
		header: '删除确认',
		body: '确认删除该键吗？',
		theme: 'danger',
		confirmBtn: { loading: isKeyRemoveLoading.value, theme: 'danger', variant: 'outline' },
		onConfirm: async () => {
			await removeKey(key)
			useEventBus(keyRemovedEventKey).emit(key)
			MessagePlugin.success('删除成功')
			dialogInstance.destroy()
		},
	})
}

defineExpose({ init })
</script>

<style scoped lang="scss">
.sider-list {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-m);
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
		position: relative;
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

		&:hover > .body_item_action {
			visibility: visible;
			opacity: 1;
		}

		&_label {
			flex: 1;
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
}
</style>
