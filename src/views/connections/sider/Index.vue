<template>
	<div class="sider">
		<div class="header">
			<TInput v-model="keyword" placeholder="搜索" clearable>
				<template #prefixIcon><Icon height="16" width="16" icon="fluent:search-16-regular" /></template>
			</TInput>
			<TTooltip content="添加连接" :show-arrow="false" placement="right">
				<TButton variant="dashed" theme="default" shape="square" @click="handleEditConnectionClick()">
					<template #icon><Icon height="16" width="16" icon="fluent:add-16-regular" /></template>
				</TButton>
			</TTooltip>
		</div>
		<div class="body">
			<TCollapse v-model="expandedConnections" borderless expand-mutex>
				<TCollapsePanel
					v-for="(item, index) in filteredConnections"
					:key="item.id"
					destroy-on-collapse
					:value="item.id"
					:header="item.name"
					class="connection"
					:class="{ 'is-top': item.top, 'is-connected': item.connected === 'connected' }"
				>
					<template #headerRightContent>
						<div class="connection_actions" @click.stop>
							<TDropdown>
								<Icon
									class="connection_actions_item is-hide"
									height="16"
									width="16"
									icon="fluent:more-vertical-16-regular"
								/>
								<TDropdownMenu>
									<TDropdownItem @click="handleConnectionTopClick(item.id, item.top)">
										<template #prefixIcon>
											<Icon height="16" width="16" :icon="generateConnectionTopDropdownItem(item.top).icon" />
										</template>
										<span>{{ generateConnectionTopDropdownItem(item.top).text }}</span>
									</TDropdownItem>
									<TDropdownItem :divider="true" @click="handleConnectionDisplayChange(item)">
										<template #prefixIcon>
											<Icon height="16" width="16" :icon="generateDisplayDropdownItem(item.display).icon" />
										</template>
										<span>{{ generateDisplayDropdownItem(item.display).text }}</span>
									</TDropdownItem>
									<TDropdownItem @click="handleEditConnectionClick(item.id)">
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-16-regular" /></template>
										<span>编辑</span>
									</TDropdownItem>
									<TDropdownItem
										theme="warning"
										v-if="['connected', 'connecting'].includes(item.connected)"
										@click="handleConnectionDisconnectClick(item.id)"
									>
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:power-20-regular" /></template>
										<span>关闭</span>
									</TDropdownItem>
									<TDropdownItem theme="error" @click="handleConnectionRemoveClick(item.id)">
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:delete-16-regular" /></template>
										<span>删除</span>
									</TDropdownItem>
								</TDropdownMenu>
							</TDropdown>
						</div>
					</template>
					<component :is="item.display === 'tree' ? Tree : List" :connection="item" @error="handleConnectionError" />
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
		<EditDialog ref="editDialogRef" @update="handleConnectionUpdate" />
	</div>
</template>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { pull } from 'lodash-es'
import { Connection, useConnectionsStore } from '@/store'
import EditDialog from './EditDialog.vue'
import Tree from './Tree.vue'
import List from './List.vue'
import { connectionDisconnectedEventKey } from '../keys'
import { useLoading } from '@/hooks'

defineOptions({ name: 'ConnectionsSiderIndex' })

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

// empty click
function handleEmptyClick() {
	handleEditConnectionClick()
}

// add or edit connection
const editDialogRef = ref<InstanceType<typeof EditDialog>>()
function handleEditConnectionClick(id?: string) {
	editDialogRef.value.open(id)
}

// connection update
function handleConnectionUpdate() {}

// top connection
function generateConnectionTopDropdownItem(top: boolean) {
	return {
		text: top ? '取消置顶' : '置顶',
		icon: top ? 'fluent:pin-off-16-regular' : 'fluent:pin-16-regular',
	}
}
function handleConnectionTopClick(id: string, top: boolean) {
	top ? connectionsStore.cancelTopConnection(id) : connectionsStore.topConnection(id)
}

// display switch
function generateDisplayDropdownItem(display: Connection['display']) {
	const isTree = display === 'tree'
	return {
		text: isTree ? '列表视图' : '树形视图',
		icon: isTree ? 'fluent:text-bullet-list-ltr-16-regular' : 'fluent:text-bullet-list-tree-16-regular',
	}
}
function handleConnectionDisplayChange(connection: Connection) {
	connection.display = connection.display === 'tree' ? 'list' : 'tree'
	connectionsStore.updateConnection(connection)
}

// remove connection
const { isLoading: isRemoveLoading, enter: enterRemoveLoading, exit: exitRemoveLoading } = useLoading()
function handleConnectionRemoveClick(id: string) {
	const dialogInstance = DialogPlugin.confirm({
		header: '删除连接',
		body: '确定要删除该连接吗？',
		theme: 'danger',
		confirmBtn: { loading: isRemoveLoading.value },
		onConfirm: async () => {
			try {
				enterRemoveLoading()
				await connectionsStore.removeConnection(id)
				MessagePlugin.success('删除成功')
				dialogInstance.destroy()
			} finally {
				exitRemoveLoading()
			}
		},
	})
}

// disconnect connection
const expandedConnections = ref<string[]>([])
async function handleConnectionDisconnectClick(id: string) {
	await connectionsStore.disconnectConnection(id)
	pull(expandedConnections.value, id)
	useEventBus(connectionDisconnectedEventKey).emit(filteredConnections.value.find(item => item.id === id))
}

// connection connecting error
function handleConnectionError(id: string) {
	pull(expandedConnections.value, id)
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
		border-bottom: 1px solid var(--td-component-stroke);
	}

	:deep(.t-collapse-panel__content) {
		position: relative;
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
}
</style>
