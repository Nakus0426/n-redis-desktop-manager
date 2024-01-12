<template>
	<OverlayScrollbar class="sider" ref="containerRef">
		<template v-for="item in connectionsStore.connections" :key="item.id">
			<div class="cell" :style="`--name: ${item.id}`">
				<ContextMenu :options="generateContextMenu(item)" @select="value => handleContextMenuClick(value, item.id)">
					<div class="cell_header" :class="headerClass[item.id]" v-ripple @click="handleConnectionClick(item)">
						<Icon class="cell_header_top" height="16" width="16" icon="fluent:pin-16-filled" v-if="item.top" />
						<Icon
							class="cell_header_arrow"
							height="16"
							width="16"
							:icon="
								connectionLoadingMap.get(item.id).isLoading.value
									? 'svg-spinners:bars-rotate-fade'
									: 'fluent:chevron-down-16-regular'
							"
						/>
						<TTooltip :show-arrow="false" theme="light" placement="top" content="已连接">
							<div class="cell_header_connected" v-if="item.connected === 'connected'" />
						</TTooltip>
						<TextEllipsis class="cell_header_label" :content="item.name" />
					</div>
				</ContextMenu>
				<div class="cell_body">
					<component
						:is="item.display === 'list' ? List : Tree"
						:connection="item"
						:ref="el => bindBodyRef(el, `${item.display}-${item.id}`)"
					/>
				</div>
			</div>
		</template>
		<div class="empty" v-if="connectionsStore.connections.length === 0">无数据</div>
	</OverlayScrollbar>
</template>

<script setup lang="ts">
import { set } from 'lodash-es'
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import type { ContextMenuOption } from '@/components/ContextMenu.vue'
import { type Connection, useConnectionsStore } from '@/store/modules/connections'
import { useTabs } from '../hooks'
import List from './List.vue'
import Tree from './Tree.vue'
import { useLoading } from '@/hooks/useLoading'

const emit = defineEmits<{ edit: [string] }>()

const connectionsStore = useConnectionsStore()
const { activedTab, addTab } = useTabs()

// context menu
function generateContextMenu(connection: Connection) {
	const connected = connection.connected === 'connected'
	const isDisplayList = connection.display === 'list'
	const contextMenu: ContextMenuOption[] = [
		{
			label: connection.top ? '取消置顶' : '置于顶部',
			value: connection.top ? 'cancelTop' : 'top',
			icon: `fluent:pin${connection.top ? '-off' : ''}-16-regular`,
		},
		{ label: '编辑', value: 'edit', icon: 'fluent:settings-16-regular' },
		{ label: '删除', value: 'remove', icon: 'fluent:delete-16-regular', theme: 'error' },
		{
			label: isDisplayList ? '树形视图' : '列表视图',
			value: isDisplayList ? 'tree' : 'list',
			icon: isDisplayList ? 'fluent:text-bullet-list-16-regular' : 'fluent:text-bullet-list-tree-16-regular',
			divider: true,
		},
		{
			label: connected ? '断开连接' : '建立连接',
			value: connected ? 'disconnect' : 'connect',
			icon: 'fluent:power-20-regular',
			theme: connected ? 'error' : 'success',
		},
	]
	return contextMenu
}
function handleContextMenuClick(value: ContextMenuOption['value'], id: string) {
	if (value === 'edit') emit('edit', id)
	if (value === 'top') connectionsStore.topConnection(id)
	if (value === 'cancelTop') connectionsStore.cancelTopConnection(id)
	if (value === 'connect') connectionsStore.connectConnection(id)
	if (value === 'disconnect') connectionsStore.disconnectConnection(id)
	if (value === 'list' || value === 'tree') {
		const connection = connectionsStore.connections.find(item => item.id === id)
		connection.display = value
		connectionsStore.updateConnection(connection)
	}
	if (value === 'remove') {
		const { isLoading: isRemoveLoading, enter: enterRemoveLoading, exit: exitRemoveLoading } = useLoading()
		const dialogInstance = DialogPlugin.confirm({
			header: '删除确认',
			body: '确定要删除该连接吗？',
			theme: 'danger',
			placement: 'center',
			confirmBtn: { loading: isRemoveLoading.value, theme: 'danger' },
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
}

// header class
const headerClass = computed(() => {
	const classMap = {}
	connectionsStore.connections.forEach(item => {
		set(classMap, `${item.id}.is-expanded`, expandedConnectionId.value === item.id)
		set(classMap, `${item.id}.is-connected`, item.connected === 'connected')
	})
	return classMap
})

// connection click
const expandedConnectionId = ref<string>()
const connectionLoadingMap = computed(() => {
	const map = new Map<string, ReturnType<typeof useLoading>>()
	connectionsStore.connections.forEach(item => map.set(item.id, useLoading(0)))
	return map
})
async function handleConnectionClick(connection: Connection) {
	const { id, name: title, display } = connection
	try {
		connectionLoadingMap.value.get(id).enter()
		if (connection.connected === 'disconnected') await connectionsStore.connectConnection(id)
		const isSameConnection = expandedConnectionId.value === id
		if (!isSameConnection) await bodyRef.value.get(`${display}-${id}`).init()
		if (!isSameConnection && activedTab.value?.key !== id) addTab({ id, key: id, title, isConnection: true })
		expandedConnectionId.value = isSameConnection ? null : id
	} finally {
		connectionLoadingMap.value.get(id).exit()
	}
}

// body ref
const bodyRef = ref(new Map<string, InstanceType<typeof List | typeof Tree>>())
function bindBodyRef(el: any, id: string) {
	bodyRef.value.set(id, el)
}
</script>

<style scoped lang="scss">
.sider {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--td-component-stroke);
}

.cell {
	position: relative;
	display: flex;
	flex-direction: column;
	view-transition-name: var(--name);

	&_header {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		font: var(--td-font-body-large);
		color: var(--td-text-color-primary);
		padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-m);
		border-bottom: 1px solid transparent;
		transition: all var(--td-transition);
		cursor: pointer;
		z-index: 3;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&.is-expanded {
			background-color: var(--td-bg-color-container-opacity);
			backdrop-filter: blur(15px);
			border-bottom: 1px solid var(--td-component-stroke);

			.cell_header_arrow {
				transform: rotate(180deg);
			}

			+ .cell_body {
				height: auto;
				grid-template-rows: 1fr;
				opacity: 1;
				border-bottom: 1px solid var(--td-component-stroke);
			}
		}

		&_top {
			color: var(--td-brand-color);
			position: absolute;
			top: var(--td-comp-paddingTB-s);
			right: var(--td-comp-paddingLR-s);
		}

		&_connected {
			height: 6px;
			width: 6px;
			border-radius: 3px;
			background-color: var(--td-success-color);
		}

		&_arrow {
			color: var(--td-text-color-secondary);
			transition: all var(--td-transition);
		}
	}

	&_body {
		position: relative;
		height: 0;
		display: grid;
		grid-template-rows: 0fr;
		border-bottom: 1px solid transparent;
		transition: all var(--td-transition);
		opacity: 0;
		overflow: hidden;
	}
}

.empty {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	font: var(--td-font-body-medium);
	color: var(--td-text-color-secondary);
}
</style>
