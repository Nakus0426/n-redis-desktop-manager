<template>
	<ContainerWithSider class="links">
		<template #sider>
			<Sider @link-change="handleLinkChange" @key-change="handleKeyChange" />
		</template>
		<div class="window-header" />
		<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in" appear>
			<TTabs class="content" v-model="activedTabPanel" v-show="!isEmpty" @remove="handleTabRemove">
				<TTabPanel :value="item.key" removable v-for="item in tabPanels">
					<template #label>
						<div class="tab-panel_label" :title="item.label">
							<Icon height="16" width="16" :icon="item.icon" />
							<div class="tab-panel_label_title">{{ item.label }}</div>
						</div>
					</template>
					<component :is="item.type === 'Overview' ? Overview : KeyEdit" />
				</TTabPanel>
			</TTabs>
		</Transition>
		<Empty description="请先选择一个连接或键" size="large" v-show="isEmpty" />
	</ContainerWithSider>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import Sider from './Sider.vue'
import Overview from './Overview.vue'
import KeyEdit from './KeyEdit.vue'
import { type Link } from '@/store'

// tabs
interface TabPanel {
	key: string
	label: string
	type: 'Overview' | 'KeyEdit'
	icon: string
}
const tabPanels = ref<TabPanel[]>([])
const activedTabPanel = ref<string>()

// handle tab remove
function handleTabRemove({ index }: { index: number }) {
	tabPanels.value.splice(index, 1)
	if (tabPanels.value.length === 0) activedTabPanel.value = null
}

// is empty
const isEmpty = computed(() => tabPanels.value.length === 0)

// handle link change
function handleLinkChange(link: Link) {
	activedTabPanel.value = link.id
	if (tabPanels.value.findIndex(item => item.key === link.id) >= 0) return
	tabPanels.value.push({
		key: link.id,
		label: link.name,
		type: 'Overview',
		icon: 'fluent:database-multiple-20-regular',
	})
}

// handle key change
function handleKeyChange(key: string) {
	activedTabPanel.value = key
	if (tabPanels.value.findIndex(item => item.key === key) >= 0) return
	tabPanels.value.push({
		key,
		label: key,
		type: 'KeyEdit',
		icon: 'fluent:key-20-regular',
	})
}
</script>

<style scoped lang="scss">
.window-header {
	height: var(--window-action-height);
	width: calc(100% - 120px);
	-webkit-app-region: drag;
}

.content {
	height: calc(100% - var(--window-action-height));
	background-color: transparent;
	width: 100%;

	:deep(.t-tabs__nav) {
		-webkit-app-region: drag;
	}

	:deep(.t-tabs__nav-container) {
		&::after {
			background-color: var(--td-component-border);
		}
	}

	:deep(.t-tabs__nav-scroll) {
		padding: 0 var(--td-comp-paddingLR-m);
	}

	:deep(.t-tabs__nav-wrap) {
		-webkit-app-region: no-drag;
	}

	:deep(.t-tabs__nav-item.t-size-m) {
		height: var(--td-comp-size-xl);
		line-height: var(--td-comp-size-xl);
	}

	:deep(.t-tabs__btn.t-size-m) {
		height: calc(var(--td-comp-size-xl) - 1px);
		line-height: calc(var(--td-comp-size-xl) - 1px);
		border: none;
		background-color: var(--td-bg-color-page);

		&:hover {
			background-color: var(--td-bg-color-container-active);
		}
	}

	:deep(.t-tabs__nav-item:not(.t-is-disabled):not(.t-is-active):hover .t-tabs__nav-item-wrapper) {
		background-color: var(--td-bg-color-container-active);
		--ripple-color: var(--td-bg-color-secondarycontainer-active);
	}

	:deep(.t-is-active .tab-panel_label) {
		color: var(--td-brand-color);
	}

	.tab-panel_label {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		color: var(--td-text-color-secondary);
		max-width: 120px;

		&_title {
			font: var(--td-font-body-medium);
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}

:deep(.empty) {
	height: 100%;
	-webkit-app-region: drag;
}
</style>
