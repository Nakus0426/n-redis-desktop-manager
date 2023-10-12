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
			<TransitionGroup name="body">
				<div class="body_item" v-for="item in filteredConnections" :key="item.id" :id="item.id">
					<div
						class="body_item_header"
						:class="generateConnectionClass(item)"
						v-ripple
						@click="handleConnectionClick(item.id)"
					>
						<Icon class="body_item_header_arrow" height="16" width="16" icon="fluent:chevron-down-16-regular" />
						<TextEllipsis class="body_item_header_title" :content="item.name" />
						<div class="body_item_header_actions">
							<TDropdown>
								<Icon
									class="body_item_header_actions_item"
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
					</div>
					<div class="body_item_content">
						<component
							:is="item.display === 'tree' ? ContentTree : ContentList"
							:ref="el => generateContentRef(el, item.id)"
							:connection="item"
							@error="handleConnectionError"
						/>
					</div>
				</div>
			</TransitionGroup>
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
import { Connection, useConnectionsStore } from '@/store'
import EditDialog from './EditDialog.vue'
import ContentTree from './Tree.vue'
import ContentList from './List.vue'
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

// generate content refs
const contentRefs = new Map<string, any>()
function generateContentRef(el, id: string) {
	contentRefs.set(id, el)
}

// connection click
const activedConnectionId = ref<string>()
function handleConnectionClick(id: string) {
	activedConnectionId.value = activedConnectionId.value === id ? null : id
	if (activedConnectionId.value) contentRefs.get(activedConnectionId.value).init()
}

// generate connection class
function generateConnectionClass(connection: Connection) {
	return {
		'is-top': connection.top,
		'is-connected': connection.connected,
		'is-actived': connection.id === activedConnectionId.value,
	}
}

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
async function handleConnectionDisconnectClick(id: string) {
	await connectionsStore.disconnectConnection(id)
	useEventBus(connectionDisconnectedEventKey).emit(filteredConnections.value.find(item => item.id === id))
}

// connection connecting error
function handleConnectionError(id: string) {}
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

	&_item {
		width: 100%;

		&_header {
			position: sticky;
			top: 0;
			height: 50px;
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-s);
			padding: 0 var(--td-comp-paddingLR-m);
			transition: all var(--td-transition);
			color: var(--td-text-color-primary);
			background-color: var(--td-bg-color-container);
			cursor: pointer;
			z-index: 3;
			--ripple-color: var(--td-bg-color-container-active);

			&:hover {
				background-color: var(--td-bg-color-container-hover);

				.body_item_header_actions_item {
					opacity: 1;
				}
			}

			&.is-actived {
				.body_item_header_arrow {
					transform: rotate(180deg);
				}

				+ .body_item_content {
					grid-template-rows: 1fr;
					opacity: 1;
					max-height: calc(100vh - 174px);
				}
			}

			&.is-top::before {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				background-color: var(--td-brand-color);
				width: 14px;
				height: 14px;
				clip-path: polygon(0 0, 0% 100%, 100% 0);
			}

			&.is-connected::after {
				content: '';
				position: absolute;
				right: var(--td-comp-paddingLR-s);
				top: var(--td-comp-paddingLR-s);
				background-color: var(--td-success-color);
				width: 5px;
				height: 5px;
				border-radius: 50%;
			}

			&_arrow {
				transition: all var(--td-transition);
			}

			&_title {
				flex: 1;
				font: var(--td-font-mark-medium);
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
					opacity: 0;

					&:hover {
						color: var(--td-brand-color);
					}
				}
			}
		}

		&_content {
			position: relative;
			display: grid;
			grid-template-rows: 0fr;
			transition: all var(--td-transition);
			opacity: 0;
			max-height: 0;
			overflow: hidden;
		}
	}

	&-enter-active,
	&-leave-active,
	&-move {
		transition: all var(--td-transition);
	}

	&-enter-from,
	&-leave-to {
		opacity: 0;
		transform: scaleY(0.01) translate(30px, 0);
	}

	&-leave-active {
		position: absolute;
		z-index: 99;
	}

	&_empty {
		height: 100%;
	}
}
</style>
