<template>
	<ContainerWithSider class="connections">
		<template #sider>
			<Sider />
		</template>
		<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in" appear>
			<div class="content">
				<div class="window-header" />
				<div class="content_header" v-show="!isEmpty">
					<div
						class="content_header_prefix"
						:class="tabsOverflowButtonVisibleClass"
						v-ripple
						@click="handleTabsOverflowButtonClick('prefix')"
					>
						<Icon height="18" width="18" icon="fluent:chevron-left-20-regular" />
					</div>
					<div class="content_header_divider" v-show="tabsOverlow" />
					<div class="content_header_center" ref="tabsRef">
						<TransitionGroup
							enter-active-class="animate__animated animate__fadeInLeft animate__faster"
							leave-active-class="animate__animated animate__fadeOut animate__faster tabs-leave-animate"
							appear
						>
							<div
								class="content_header_center_item"
								:class="tabActivedClass(item.key)"
								v-for="(item, index) in tabPanels"
								:key="item.key"
								:ref="ref => generateTabRef(item.key, ref)"
								:title="item.label"
								v-ripple
								@click="handleTabClick(item)"
							>
								<div class="content_header_center_item_label">
									<Icon height="16" width="16" :icon="item.icon" />
									<div class="content_header_center_item_label_text">{{ item.label }}</div>
								</div>
								<div class="content_header_center_item_close" @click.stop="handleTabRemove(index, item.key)">
									<Icon height="14" width="14" icon="fluent:dismiss-20-regular" />
								</div>
							</div>
						</TransitionGroup>
					</div>
					<div class="content_header_divider" v-show="tabsOverlow" />
					<div
						class="content_header_suffix"
						:class="tabsOverflowButtonVisibleClass"
						v-ripple
						@click="handleTabsOverflowButtonClick('suffix')"
					>
						<Icon height="18" width="18" icon="fluent:chevron-right-20-regular" />
					</div>
				</div>
				<div class="content_body">
					<component
						v-for="item in tabPanels"
						:key="item.key"
						:is="item.type === 'Overview' ? Overview : KeyEdit"
						v-show="item.key === activedTabPanel.key"
					/>
				</div>
				<Empty class="content-empty" description="" icon="logo" size="large" v-show="isEmpty" />
			</div>
		</Transition>
	</ContainerWithSider>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { useEventBus } from '@vueuse/core'
import {
	connectionConnectedEventKey,
	connectionDisconnectedEventKey,
	keyActivedEventKey,
	tabActivedEventKey,
} from './events'
import Sider from './Sider.vue'
import Overview from './Overview.vue'
import KeyEdit from './KeyEdit.vue'

// connection connected
useEventBus(connectionConnectedEventKey).on(connection => {
	const tabPanel: TabPanel = {
		key: connection.id,
		label: connection.name,
		type: 'Overview',
		icon: 'fluent:database-multiple-20-regular',
	}
	activedTabPanel.value = tabPanel
	if (tabPanels.value.findIndex(item => item.key === connection.id) >= 0) return
	tabPanels.value.push(tabPanel)
})

// connection disconnected
useEventBus(connectionDisconnectedEventKey).on(connection => {
	const index = tabPanels.value.findIndex(item => item.key === connection.id)
	if (index >= 0) handleTabRemove(index, connection.id)
})

// key actived
useEventBus(keyActivedEventKey).on(key => {
	const tabPanel: TabPanel = {
		key,
		label: key,
		type: 'KeyEdit',
		icon: 'fluent:key-20-regular',
	}
	activedTabPanel.value = tabPanel
	if (tabPanels.value.findIndex(item => item.key === key) >= 0) return
	tabPanels.value.push(tabPanel)
})

// generate tab ref
const tabRefs: Map<string, Element> = new Map()
function generateTabRef(key: string, el: Element | ComponentPublicInstance) {
	tabRefs.set(key, el as Element)
}

// tabs overflow button click
function handleTabsOverflowButtonClick(type: 'prefix' | 'suffix') {
	const scrollWidth = tabsRef.value.clientWidth
	const currentPoint = tabsRef.value.scrollLeft
	tabsRef.value.scrollTo({
		left: type === 'prefix' ? currentPoint - scrollWidth : currentPoint + scrollWidth,
		behavior: 'smooth',
	})
}

// tabs
interface TabPanel {
	key: string
	label: string
	type: 'Overview' | 'KeyEdit'
	icon: string
}
const tabPanels = ref<TabPanel[]>([])
const activedTabPanel = ref<TabPanel>()

// is tabs overflow
const tabsOverlow = ref(false)
const tabsOverflowButtonVisibleClass = computed(() => (tabsOverlow.value ? 'is-show' : ''))
const tabsRef = ref<HTMLElement>()
function calcTabsOverflow() {
	nextTick(() => {
		tabsOverlow.value = tabsRef.value.scrollWidth > tabsRef.value.clientWidth
	})
}
useResizeObserver(tabsRef, calcTabsOverflow)
watch(
	() => tabPanels.value.length,
	value => value > 0 && calcTabsOverflow(),
	{ immediate: true }
)

// tab remove
function handleTabRemove(index: number, key: string) {
	const length = tabPanels.value.length
	tabPanels.value.splice(index, 1)
	const oldTabPanels = cloneDeep(tabPanels.value)
	if (activedTabPanel.value.key === key && length > 1) {
		const prefixTabPanel = oldTabPanels?.[index - 1]
		const suffixTabPanel = oldTabPanels?.[index + 1]
		activedTabPanel.value = prefixTabPanel ?? suffixTabPanel
	}
	if (length === 1) {
		activedTabPanel.value = null
	}
}

// is empty
const isEmpty = computed(() => tabPanels.value.length === 0)

// is tab actived
function tabActivedClass(key: string) {
	return activedTabPanel.value.key === key ? 'is-actived' : ''
}

// tab click
const tabActivedEventBus = useEventBus(tabActivedEventKey)
function handleTabClick(value: TabPanel) {
	activedTabPanel.value = value
	tabActivedEventBus.emit(value.key)
	if (tabsOverlow.value) tabRefs.get(value.key).scrollIntoView({ inline: 'center', behavior: 'smooth' })
}
</script>

<style scoped lang="scss">
.content-empty {
	height: 100%;
}

.content {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	overflow: hidden;

	&_header {
		display: flex;
		align-items: center;
		padding: 0 var(--td-comp-margin-m) var(--td-comp-margin-m) var(--td-comp-margin-m);
		border-bottom: 1px solid var(--td-component-border);
		-webkit-app-region: drag;

		&_prefix,
		&_suffix {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 32px;
			width: 0;
			border-radius: var(--td-radius-default);
			color: var(--td-text-color-primary);
			cursor: pointer;
			transition: all var(--td-transition);
			--ripple-color: var(--td-bg-color-secondarycontainer-active);
			-webkit-app-region: no-drag;

			&:hover {
				background-color: var(--td-bg-color-container-active);
			}

			&.is-show {
				width: 32px;
			}
		}

		&_divider {
			width: 1px;
			height: 24px;
			background-color: var(--td-component-border);
			margin: 0 calc(var(--td-comp-margin-s) / 2);
			-webkit-app-region: no-drag;
		}

		&_center {
			flex: 1;
			display: flex;
			gap: var(--td-comp-margin-s);
			overflow: auto hidden;

			&_item {
				display: flex;
				justify-content: center;
				align-items: center;
				gap: var(--td-comp-margin-s);
				flex-shrink: 0;
				height: 32px;
				max-width: 180px;
				overflow: hidden;
				border-radius: var(--td-radius-default);
				color: var(--td-text-color-secondary);
				padding: 0 var(--td-comp-paddingLR-s);
				cursor: pointer;
				transition: all var(--td-transition);
				--ripple-color: var(--td-bg-color-secondarycontainer-active);
				-webkit-app-region: no-drag;

				&:hover {
					background-color: var(--td-bg-color-container-active);

					.content_header_center_item_label {
						color: var(--td-text-color-primary);
					}

					.content_header_center_item_close {
						width: 14px;
					}
				}

				&.is-actived {
					background-color: var(--td-bg-color-container-select);
					color: var(--td-text-color-primary);
					--ripple-color: var(--td-bg-color-container-active);
				}

				&_label {
					flex: 1;
					display: flex;
					align-items: center;
					gap: var(--td-comp-margin-xs);
					overflow: hidden;

					svg {
						color: var(--td-brand-color);
					}

					&_text {
						flex: 1;
						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
					}
				}

				&_close {
					display: flex;
					align-items: center;
					width: 0;
					transition: all var(--td-transition);

					&:hover {
						color: var(--td-error-color);
					}
				}
			}
		}
	}

	&_body {
		flex: 1;
		overflow: hidden;
	}
}

.window-header {
	height: var(--window-action-height);
	width: calc(100% - 120px);
	-webkit-app-region: drag;
}

.tabs-leave-animate {
	transition: all var(--td-transition);
	position: absolute !important;
}
</style>
