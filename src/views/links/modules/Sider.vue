<template>
	<div class="sider">
		<div class="header">
			<TInput placeholder="搜索" v-model="keyword">
				<template #prefixIcon><Icon height="16" width="16" icon="fluent:search-20-regular" /></template>
			</TInput>
			<TButton variant="dashed" theme="default" @click="handleEditLinkClick()">
				<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
			</TButton>
		</div>
		<div class="body" ref="bodyRef">
			<TCollapse v-model="expandedLinks" borderless expand-mutex @change="handleLinkCollapseChange">
				<TCollapsePanel
					v-for="(item, index) in filteredLinks"
					:key="item.id"
					:header="item.name"
					class="link"
					:class="{ 'is-top': item.top, 'is-connected': item.connected }"
				>
					<template #headerRightContent>
						<div class="link_actions" @click.stop>
							<TDropdown>
								<Icon class="link_actions_item is-hide" height="16" width="16" icon="fluent:more-vertical-20-regular" />
								<TDropdownMenu>
									<TDropdownItem :divider="true" @click="handleLinkTopClick(item.id, item.top)">
										<template #prefixIcon>
											<Icon height="16" width="16" :icon="generateTopDropdownItem(item.top).icon" />
										</template>
										<span>{{ generateTopDropdownItem(item.top).text }}</span>
									</TDropdownItem>
									<TDropdownItem
										theme="warning"
										v-if="item.connected"
										@click="handleLinkDisconnectClick(item.id, index)"
									>
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:power-20-regular" /></template>
										<span>关闭</span>
									</TDropdownItem>
									<TDropdownItem @click="handleEditLinkClick(item.id)">
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-20-regular" /></template>
										<span>编辑</span>
									</TDropdownItem>
									<TDropdownItem theme="error" @click="handleLinkRemoveClick(item.id)">
										<template #prefixIcon><Icon height="16" width="16" icon="fluent:delete-20-regular" /></template>
										<span>删除</span>
									</TDropdownItem>
								</TDropdownMenu>
							</TDropdown>
						</div>
					</template>
					<TLoading
						class="link_content"
						:loading="linkLoadingMap.get(item.id) ?? false"
						text="正在连接..."
						size="small"
					>
						<div class="link_content_actions">
							<TInput size="small" placeholder="搜索">
								<template #prefixIcon><Icon height="14" width="14" icon="fluent:search-20-regular" /></template>
							</TInput>
							<TButton size="small" theme="default" variant="outline">
								<template #icon><Icon height="15" width="15" icon="fluent:add-20-regular" /></template>
							</TButton>
							<TButton size="small" theme="default" variant="outline">
								<template #icon><Icon height="15" width="15" icon="fluent:add-20-regular" /></template>
							</TButton>
						</div>
						<!-- <TTree :data="tree" expand-mutex expand-on-click-node hover line check-strictly></TTree> -->
					</TLoading>
				</TCollapsePanel>
			</TCollapse>
			<Empty
				:description="emptyStatus.description"
				:icon="emptyStatus.icon"
				:clickable="emptyStatus.clickable"
				v-if="emptyStatus.visible"
				@click="handleEmptyClick()"
			/>
		</div>
		<Edit ref="editRef" @update="handleLinkUpdate" />
	</div>
</template>

<script setup lang="ts">
import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import Edit from './Edit.vue'
import { useLinksStore } from '@/store'
import { type CollapseValue, DialogPlugin, MessagePlugin } from 'tdesign-vue-next'

const linksStore = useLinksStore()

// keyword filter
const keyword = ref<string>()
const filteredLinks = computed(() => {
	if (!keyword.value) return linksStore.links
	return linksStore.links.filter(item => item.name.includes(keyword.value))
})

// is links empty
const emptyStatus = computed(() => {
	const visible = filteredLinks.value.length === 0
	const clickable = !keyword.value
	const description = clickable ? '点击添加连接' : '没有找到相关连接'
	const icon = clickable ? 'addToInbox' : 'nothingHere'
	return { visible, clickable, description, icon }
})

// handle empty click event
function handleEmptyClick() {
	handleEditLinkClick()
}

// scrollbar
const bodyRef = ref()
const [initScrollBar] = useOverlayScrollbars({ options: { scrollbars: { autoHide: 'leave' } }, defer: true })
onMounted(() => initScrollBar(bodyRef.value))

// handle add or edit link event
const editRef = ref<InstanceType<typeof Edit>>()
function handleEditLinkClick(id?: string) {
	editRef.value.open(id)
}

// handle link update event
function handleLinkUpdate() {}

// handle top link event
function generateTopDropdownItem(top: boolean) {
	return {
		text: top ? '取消置顶' : '置顶',
		icon: top ? 'fluent:pin-off-20-regular' : 'fluent:pin-20-regular',
	}
}
function handleLinkTopClick(id: string, top: boolean) {
	top ? linksStore.cancelTopLink(id) : linksStore.topLink(id)
}

// handle remove link event
function handleLinkRemoveClick(id: string) {
	const loading = ref(false)
	const dialogInstance = DialogPlugin.confirm({
		header: '删除连接',
		body: '确定要删除该连接吗？',
		theme: 'danger',
		confirmBtn: { loading: loading.value },
		onConfirm: async () => {
			try {
				loading.value = true
				await linksStore.removeLink(id)
				MessagePlugin.success('删除成功')
				dialogInstance.destroy()
			} finally {
				loading.value = false
			}
		},
	})
}

// handle disconnect link event
async function handleLinkDisconnectClick(id: string, index: number) {
	await linksStore.disconnectLink(id)
	expandedLinks.value.splice(index, 1)
}

// handle collapse change
const expandedLinks = ref<number[]>([])
const linkLoadingMap = ref(new Map<string, boolean>())
async function handleLinkCollapseChange(value: CollapseValue) {
	if (!value || value.length === 0) return
	const link = filteredLinks.value[value[0]]
	try {
		linkLoadingMap.value.set(link.id, true)
		await linksStore.connectLink(link.id)
	} catch (error) {
		MessagePlugin.error(error.message)
	} finally {
		linkLoadingMap.value.set(link.id, false)
	}
}

const tree = [
	{
		label: '第一段',
		children: [
			{
				label: '第一段',
			},
			{
				label: '第二段',
			},
		],
	},
	{
		label: '第二段',
		children: [
			{
				label: '第一段',
			},
			{
				label: '第二段',
			},
		],
	},
	{
		label: '第三段',
		children: [
			{
				label: '第一段',
			},
			{
				label: '第二段',
			},
		],
	},
	{
		label: '第四段',
		children: [
			{
				label: '第一段',
			},
			{
				label: '第二段',
			},
		],
	},
]
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
	padding: var(--td-comp-paddingTB-m);
	-webkit-app-region: drag;

	div,
	button {
		-webkit-app-region: no-drag;
	}
}

.body {
	flex: 1;

	&:has(.empty) {
		display: flex;
		align-items: center;
	}

	:deep(.t-collapse-panel__wrapper) {
		overflow: visible;
	}

	:deep(.t-collapse-panel__header) {
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: var(--td-bg-color-container);
		transition: background-color var(--td-transition);

		&:hover {
			background-color: var(--td-bg-color-container-hover);

			.link_actions_item {
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

.link {
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
		min-height: 60px;
		padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-m);

		:deep(.t-is-active .t-tree__label) {
			background-color: var(--td-brand-color);
			color: #ffffff;
		}

		:deep(.t-tree--hoverable .t-tree__label:not(.t-is-active):not(.t-is-checked):hover) {
			background-color: var(--td-bg-color-container-active);
		}

		&_actions {
			display: flex;
			gap: var(--td-comp-margin-s);
		}
	}
}
</style>
