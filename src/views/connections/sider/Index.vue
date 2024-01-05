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
							:icon="connectionLoadingMap.get(item.id) ? 'svg-spinners:ring-resize' : 'fluent:chevron-down-16-regular'"
						/>
						<TTooltip :show-arrow="false" theme="light" placement="top" content="已连接">
							<Icon
								class="cell_header_connected"
								height="16"
								width="16"
								icon="fluent:plug-connected-16-regular"
								v-if="item.connected === 'connected'"
							/>
						</TTooltip>
						<TextEllipsis class="cell_header_label" :content="item.name" />
					</div>
				</ContextMenu>
				<div class="cell_body">
					<component
						:is="item.display === 'list' ? List : Tree"
						:connection="item"
						:ref="el => bindBodyRef(el, item.id)"
					/>
				</div>
			</div>
		</template>
	</OverlayScrollbar>
</template>

<script setup lang="ts">
import { set } from 'lodash-es'
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
	const contextMenu: ContextMenuOption[] = [
		{
			label: connection.top ? '取消置顶' : '置于顶部',
			value: connection.top ? 'cancelTop' : 'top',
			icon: `fluent:pin${connection.top ? '-off' : ''}-16-regular`,
		},
		{ label: '编辑', value: 'edit', icon: 'fluent:settings-16-regular' },
		{ label: '删除', value: 'remove', icon: 'fluent:delete-16-regular', theme: 'error', divider: connected },
	]
	if (connected)
		contextMenu.push({ label: '断开连接', value: 'disconnect', icon: 'fluent:power-20-regular', theme: 'error' })
	return contextMenu
}
function handleContextMenuClick(value: ContextMenuOption['value'], id: string) {
	if (value === 'edit') emit('edit', id)
	if (value === 'top') connectionsStore.topConnection(id)
	if (value === 'cancelTop') connectionsStore.cancelTopConnection(id)
	if (value === 'remove') connectionsStore.removeConnection(id)
	if (value === 'disconnect') connectionsStore.disconnectConnection(id)
}

// header class
const headerClass = computed(() => {
	const classMap = {}
	connectionsStore.connections.forEach(item => {
		set(classMap, `${item.id}.is-actived`, activedTab.value?.id === item.id)
		set(classMap, `${item.id}.is-connected`, item.connected === 'connected')
	})
	return classMap
})

// connection click
const connectionLoadingMap = ref(new Map<string, boolean>())
async function handleConnectionClick(connection: Connection) {
	const { id, name: title } = connection
	const { isLoading: isConnectionLoading, enter: enterConnectionLoading, exit: exitConnectionLoading } = useLoading()
	connectionLoadingMap.value.set(id, isConnectionLoading.value)
	try {
		enterConnectionLoading()
		if (connection.connected === 'disconnected') await connectionsStore.connectConnection(id)
		if (activedTab.value?.key !== id) addTab({ id, key: id, title, isConnection: true })
		bodyRef.value.get(id)?.init()
	} finally {
		exitConnectionLoading()
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
		cursor: pointer;
		transition: all var(--td-transition);
		z-index: 3;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&.is-actived {
			background-color: var(--td-bg-color-container-opacity);
			backdrop-filter: blur(15px);

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
			color: var(--td-success-color);
		}

		&_arrow {
			transition: all var(--td-transition);
		}
	}

	&_body {
		position: relative;
		height: 0;
		display: grid;
		grid-template-rows: 0fr;
		transition: all var(--td-transition);
		opacity: 0;
		overflow: hidden;
	}
}
</style>
