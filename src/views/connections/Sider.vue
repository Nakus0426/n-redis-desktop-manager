<template>
	<div class="sider">
		<div class="header">
			<TInput v-model="keyword" placeholder="搜索" clearable>
				<template #prefixIcon><Icon height="16" width="16" icon="fluent:search-20-regular" /></template>
			</TInput>
			<TTooltip content="添加连接" :show-arrow="false" placement="right">
				<TButton variant="dashed" theme="default" shape="square" @click="handleEditConnectionClick()">
					<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
				</TButton>
			</TTooltip>
		</div>
		<div class="body">
			<TCollapse v-model="expandedConnections" borderless expand-mutex @change="handleConnectionCollapseChange">
				<TCollapsePanel
					v-for="(item, index) in filteredConnections"
					:key="item.id"
					:value="item.id"
					:header="item.name"
					class="connection"
					:class="{ 'is-top': item.top, 'is-connected': item.connected === 'connected' }"
				>
					<template #headerRightContent>
						<div class="connection_actions" @click.stop>
							<TDropdown>
								<Icon class="connection_actions_item is-hide" height="16" width="16" icon="fluent:more-vertical-20-regular" />
								<TDropdownMenu>
									<TDropdownItem :divider="true" @click="handleConnectionTopClick(item.id, item.top)">
										<template #prefixIcon>
											<Icon height="16" width="16" :icon="generateTopDropdownItem(item.top).icon" />
										</template>
										<span>{{ generateTopDropdownItem(item.top).text }}</span>
									</TDropdownItem>
									<TDropdownItem
										theme="warning"
										v-if="['connected', 'connecting'].includes(item.connected)"
										@click="handleConnectionDisconnectClick(item.id)"
									>
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:power-20-regular" /></template>
										<span>关闭</span>
									</TDropdownItem>
									<TDropdownItem @click="handleEditConnectionClick(item.id)">
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-20-regular" /></template>
										<span>编辑</span>
									</TDropdownItem>
									<TDropdownItem theme="error" @click="handleConnectionRemoveClick(item.id)">
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:delete-20-regular" /></template>
										<span>删除</span>
									</TDropdownItem>
								</TDropdownMenu>
							</TDropdown>
						</div>
					</template>
					<TLoading :delay="500" :loading="connectionLoadingMap.get(item.id) ?? false" text="正在连接..." size="small">
						<OverlayScrollbarsComponent :options="{ scrollbars: { autoHide: 'leave', clickScroll: true } }" defer>
							<div class="connection_content" ref="connectionContentRef">
								<div class="connection_content_actions">
									<div class="connection_content_actions_row">
										<TSelect
											v-model="databaseMap[item.id]"
											:options="databaseOptions.get(item.id)"
											:loading="databaseLoadingMap.get(item.id)"
											size="small"
											@popup-visible-change="visible => visible && initDatabaseOptions(item.id)"
											@change="initConnectionKeysTree(item.id, item.separator)"
										>
											<template #prefixIcon>
												<Icon height="14" width="14" icon="fluent:database-multiple-20-regular" />
											</template>
											<template #panelTopContent>
												<div class="database_panel_top">
													<TButton
														size="small"
														block
														theme="default"
														variant="text"
														:loading="databaseLoadingMap.get(item.id)"
														@click="initDatabaseOptions(item.id)"
													>
														<template #icon>
															<Icon height="14" width="14" icon="fluent:arrow-sync-20-regular" />
														</template>
														<span>刷新</span>
													</TButton>
												</div>
											</template>
										</TSelect>
										<TTooltip content="刷新" :show-arrow="false">
											<TButton
												size="small"
												theme="default"
												variant="outline"
												@click="initConnectionKeysTree(item.id, item.separator)"
											>
												<template #icon><Icon height="16" width="16" icon="fluent:arrow-sync-20-regular" /></template>
											</TButton>
										</TTooltip>
										<TTooltip content="新增" :show-arrow="false">
											<TButton size="small" theme="default" variant="outline">
												<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
											</TButton>
										</TTooltip>
									</div>
									<div class="connection_content_actions_row">
										<TInput
											size="small"
											placeholder="搜索"
											clearable
											@change="value => handleConnectionKeysTreeFilterChange(item.id, value)"
										>
											<template #prefixIcon><Icon height="14" width="14" icon="fluent:search-20-regular" /></template>
										</TInput>
									</div>
								</div>
								<TTree
									:data="connectionKeysTreeMap.get(item.id)"
									:filter="connectionKeysTreeFilterMap.get(item.id)"
									:actived="activedKey"
									allow-fold-node-on-filter
									activable
									expand-mutex
									expand-on-click-node
									hover
									line
									check-strictly
									@active="handleKeyTreeChange"
								>
									<template #empty>
										<Empty class="connection_content_empty" icon="nothingHere" description="暂无数据" />
									</template>
								</TTree>
							</div>
							<BackTop size="small" offset="large" />
						</OverlayScrollbarsComponent>
					</TLoading>
				</TCollapsePanel>
			</TCollapse>
			<Empty
				class="body_empty"
				:description="emptyStatus.description"
				:icon="emptyStatus.icon"
				:clickable="emptyStatus.clickable"
				v-if="emptyStatus.visible"
				@click="handleEmptyClick()"
			/>
		</div>
		<Edit ref="editRef" @update="handleConnectionUpdate" />
	</div>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import {
	type CollapseValue,
	type TreeNodeModel,
	type SelectOption,
	type TreeNodeValue,
	DialogPlugin,
	MessagePlugin,
} from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { pull } from 'lodash-es'
import { useConnectionsStore } from '@/store'
import { useKeyTree } from './hooks'
import Edit from './modules/Edit.vue'
import { keyActivedEventKey, connectionConnectedEventKey, connectionDisconnectedEventKey } from './events'

const connectionsStore = useConnectionsStore()

// keyword filter
const keyword = ref<string>()
const filteredConnections = computed(() => {
	if (!keyword.value) return connectionsStore.connections
	return connectionsStore.connections.filter(item => item.name.includes(keyword.value))
})

// is connections empty
const emptyStatus = computed(() => {
	const visible = filteredConnections.value.length === 0
	const clickable = !keyword.value
	const description = clickable ? '点击添加连接' : '没有找到相关连接'
	const icon = clickable ? 'addToInbox' : 'nothingHere'
	return { visible, clickable, description, icon }
})

// handle empty click event
function handleEmptyClick() {
	handleEditConnectionClick()
}

// handle add or edit connection event
const editRef = ref<InstanceType<typeof Edit>>()
function handleEditConnectionClick(id?: string) {
	editRef.value.open(id)
}

// handle connection update event
function handleConnectionUpdate() {}

// handle top connection event
function generateTopDropdownItem(top: boolean) {
	return {
		text: top ? '取消置顶' : '置顶',
		icon: top ? 'fluent:pin-off-20-regular' : 'fluent:pin-20-regular',
	}
}
function handleConnectionTopClick(id: string, top: boolean) {
	top ? connectionsStore.cancelTopConnection(id) : connectionsStore.topConnection(id)
}

// handle remove connection event
function handleConnectionRemoveClick(id: string) {
	const loading = ref(false)
	const dialogInstance = DialogPlugin.confirm({
		header: '删除连接',
		body: '确定要删除该连接吗？',
		theme: 'danger',
		confirmBtn: { loading: loading.value },
		onConfirm: async () => {
			try {
				loading.value = true
				await connectionsStore.removeConnection(id)
				MessagePlugin.success('删除成功')
				dialogInstance.destroy()
			} finally {
				loading.value = false
			}
		},
	})
}

// handle disconnect connection event
const connectionDisconnectedEventBus = useEventBus(connectionDisconnectedEventKey)
async function handleConnectionDisconnectClick(id: string) {
	await connectionsStore.disconnectConnection(id)
	pull(expandedConnections.value, id)
	connectionDisconnectedEventBus.emit(filteredConnections.value.find(item => item.id === id))
}

// handle collapse change
const expandedConnections = ref<string[]>([])
const connectionLoadingMap = ref(new Map<string, boolean>())
async function handleConnectionCollapseChange(value: CollapseValue) {
	if (!value || value.length === 0) return
	const connection = filteredConnections.value.find(item => item.id === value[0])
	try {
		connectionLoadingMap.value.set(connection.id, true)
		await connectionsStore.connectConnection(connection.id)
		useEventBus(connectionConnectedEventKey).emit(connection)
		await initDatabaseOptions(connection.id)
		databaseMap.value[connection.id] = 0
		await initConnectionKeysTree(connection.id, connection.separator)
	} catch (error) {
		pull(expandedConnections.value, connection.id)
		connectionDisconnectedEventBus.emit(connection)
	} finally {
		connectionLoadingMap.value.set(connection.id, false)
	}
}

// init database select
const databaseLoadingMap = ref<Map<string, boolean>>(new Map())
const databaseOptions = ref<Map<string, SelectOption[]>>(new Map())
const databaseMap = ref<Record<string, number>>({})
async function initDatabaseOptions(id: string) {
	try {
		databaseLoadingMap.value.set(id, true)
		const databases = await window.mainWindow.redis.configGet(id, 'databases')
		const keyspaceStr = await window.mainWindow.redis.info(id, 'keyspace')
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
		databaseOptions.value.set(id, options)
	} finally {
		databaseLoadingMap.value.set(id, false)
	}
}

// init keys tree
const connectionKeysTreeMap = ref<Map<string, any[]>>(new Map())
async function initConnectionKeysTree(id: string, separator: string) {
	try {
		connectionLoadingMap.value.set(id, true)
		await window.mainWindow.redis.select(id, databaseMap.value[id])
		const keys = await window.mainWindow.redis.keys(id, '*')
		const tree = useKeyTree(keys, separator)
		connectionKeysTreeMap.value.set(id, [])
		nextTick(() => connectionKeysTreeMap.value.set(id, tree))
	} finally {
		connectionLoadingMap.value.set(id, false)
	}
}

// handle connection keys tree keyword filter change event
const connectionKeysTreeFilterMap = ref<Map<string, (node: TreeNodeModel) => boolean>>(new Map())
function handleConnectionKeysTreeFilterChange(id: string, value: string) {
	connectionKeysTreeFilterMap.value.set(id, node => node.label.includes(value))
}

// handle connection keys tree change
const activedKey = ref<TreeNodeValue[]>()
function handleKeyTreeChange(value: TreeNodeValue[], { node }: { node: TreeNodeModel }) {
	if (!node.data.isLeaf) return
	if (value.length !== 0) activedKey.value = value
	useEventBus(keyActivedEventKey).emit(node.value as string)
}
</script>

<style scoped lang="scss">
.sider {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

.header {
	display: flex;
	gap: var(--td-comp-margin-s);
	padding: var(--window-action-height) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m);
	-webkit-app-region: drag;

	div,
	button {
		-webkit-app-region: no-drag;
	}
}

.body {
	flex: 1;
	overflow-y: auto;

	&_empty {
		height: 100%;
	}

	:deep(.t-collapse-panel__wrapper) {
		overflow: visible;
	}

	:deep(.t-collapse-panel__header) {
		position: sticky;
		top: 0;
		z-index: 3;
		background-color: var(--td-bg-color-container);
		transition: background-color var(--td-transition);

		&:hover {
			background-color: var(--td-bg-color-container-hover);

			.connection_actions_item {
				opacity: 1;
			}
		}
	}

	:deep(.t-collapse-panel__body) {
		background-color: var(--td-bg-color-page);
		border-bottom: 1px solid var(--td-component-stroke);
	}

	:deep(.t-collapse-panel__content) {
		padding: 0;
	}
}

.connection {
	&.is-top {
		:deep(.t-collapse-panel__header::before) {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			background-color: var(--td-brand-color);
			width: 14px;
			height: 14px;
			clip-path: polygon(0 0, 0% 100%, 100% 0);
		}
	}

	&.is-connected {
		:deep(.t-collapse-panel__header::after) {
			content: '';
			position: absolute;
			right: var(--td-comp-paddingLR-s);
			top: var(--td-comp-paddingLR-s);
			background-color: var(--td-success-color);
			width: 5px;
			height: 5px;
			border-radius: 50%;
		}
	}

	&_actions {
		display: flex;
		gap: var(--td-comp-margin-s);

		&_item {
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--td-text-color-primary);
			padding: var(--td-comp-paddingLR-xxs);
			transition: all var(--td-transition);

			&.is-hide {
				opacity: 0;
			}

			&:hover {
				color: var(--td-brand-color);
			}
		}
	}

	&_content {
		display: flex;
		flex-direction: column;
		gap: var(--td-comp-margin-xs);
		padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-m);
		min-height: 60px;
		max-height: calc(100vh - 150px);

		&_actions {
			display: flex;
			flex-direction: column;
			gap: var(--td-comp-margin-s);

			&_row {
				display: flex;
				gap: var(--td-comp-margin-s);
			}

			:deep(.t-input-adornment__prepend),
			:deep(.t-input),
			:deep(.t-button) {
				background-color: var(--td-bg-color-specialcomponent);
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

		&_empty {
			padding: var(--td-comp-paddingTB-m) 0;
		}

		:deep(.t-is-active .t-tree__label) {
			background-color: var(--td-brand-color);
			color: #ffffff;
		}

		:deep(.t-tree--hoverable .t-tree__label:not(.t-is-active):not(.t-is-checked):hover),
		:deep(.t-tree__icon:not(:empty):hover) {
			background-color: var(--td-bg-color-container-active);
		}

		:deep(.t-tree__line) {
			--color: var(--td-component-border);
		}
	}
}
</style>
