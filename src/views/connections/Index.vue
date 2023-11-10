<template>
	<ContainerWithSider class="connections">
		<template #sider><Sider /></template>
		<div class="content">
			<div class="content_header">
				<div
					class="content_header_prefix"
					:class="tabsOverflowButtonVisibleClass"
					v-ripple
					v-show="tabsOverlow"
					@click="handleTabsOverflowButtonClick('prefix')"
				>
					<Icon height="16" width="16" icon="fluent:chevron-left-16-regular" />
				</div>
				<div class="content_header_center" ref="tabsRef">
					<TransitionGroup
						enter-active-class="animate__animated animate__fadeInLeft animate__faster"
						leave-active-class="animate__animated animate__fadeOut animate__faster tabs-leave-animate"
						appear
					>
						<button
							class="tab"
							:class="tabActivedClass(item.key)"
							v-for="item in tabPanels"
							:key="item.key"
							:ref="ref => generateTabRef(item.key, ref)"
							v-ripple
							@click="handleTabClick(item)"
						>
							<div class="tab_label" :title="item.label">
								<Icon height="16" width="16" :icon="item.icon" />
								<div class="tab_label_text">{{ item.label }}</div>
							</div>
							<div class="tab_close" @click.stop="handleTabRemove(item.key)">
								<Icon height="16" width="16" icon="fluent:dismiss-16-regular" />
							</div>
						</button>
					</TransitionGroup>
				</div>
				<div
					class="content_header_suffix"
					:class="tabsOverflowButtonVisibleClass"
					v-ripple
					v-show="tabsOverlow"
					@click="handleTabsOverflowButtonClick('suffix')"
				>
					<Icon height="16" width="16" icon="fluent:chevron-right-16-regular" />
				</div>
			</div>
			<div class="content_body" ref="containerRef" v-show="!emptyStatus.visible">
				<component
					v-for="item in tabPanels"
					:id="item.id"
					:data="item.key"
					:key="item.key"
					:is="item.type === 'Overview' ? Overview : KeyEdit"
					v-show="item.key === activedTabPanel.key"
				/>
			</div>
			<div class="content_empty" v-if="emptyStatus.visible">
				<Icon height="72" width="72" :icon="emptyStatus.icon" />
			</div>
		</div>
	</ContainerWithSider>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import { useEventBus } from '@vueuse/core'
import {
	activedKeyInjectKey,
	connectionConnectedEventKey,
	connectionDisconnectedEventKey,
	keyActivedEventKey,
	keyRemovedEventKey,
} from './keys'
import Sider from './sider/Index.vue'
import Overview from './overview/Index.vue'
import KeyEdit from './keyEdit/Index.vue'
import { useScrollbar } from '@/hooks'
import { useAppStore } from '@/store'

defineOptions({ name: 'ConnectionsIndex' })

// init scrollbar
const containerRef = ref()
const { init: initScrollbar } = useScrollbar(containerRef)
onMounted(() => nextTick(() => initScrollbar()))

// connection connected
useEventBus(connectionConnectedEventKey).on(connection => {
	const tabPanel: TabPanel = {
		id: connection.id,
		key: connection.id,
		label: connection.name,
		type: 'Overview',
		icon: 'fluent:database-stack-16-regular',
	}
	activedTabPanel.value = tabPanel
	if (tabPanels.value.findIndex(item => item.key === connection.id) >= 0) return
	tabPanels.value.push(tabPanel)
})

// key actived
const activeKey = ref<{ key: string; id: string }>()
provide(activedKeyInjectKey, activeKey)
useEventBus(keyActivedEventKey).on(({ key, id }) => {
	const tabPanel: TabPanel = {
		id,
		key,
		label: key,
		type: 'KeyEdit',
		icon: 'fluent:key-16-regular',
	}
	activeKey.value = { key, id }
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
	id: string
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
	{ immediate: true },
)

// connection disconnected
useEventBus(connectionDisconnectedEventKey).on(connection => {
	const disconnectedIds = tabPanels.value.filter(item => item.id === connection.id)
	disconnectedIds.forEach(item => handleTabRemove(item.key))
})

// key removed
useEventBus(keyRemovedEventKey).on(key => handleTabRemove(key))

// tab remove
function handleTabRemove(key: string) {
	const index = tabPanels.value.findIndex(item => item.key === key)
	if (index < 0) return
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
	activeKey.value = { key: activedTabPanel.value?.key, id: activedTabPanel.value?.id }
}

// is empty
const emptyStatus = computed(() => {
	const visible = tabPanels.value.length === 0
	const icon = useAppStore().isDarkTheme ? 'custom-logo-soild-dark' : 'custom-logo-soild'
	return { icon, visible }
})

// is tab actived
function tabActivedClass(key: string) {
	return activedTabPanel.value.key === key ? 'is-actived' : ''
}

// tab click
function handleTabClick(value: TabPanel) {
	activedTabPanel.value = value
	activeKey.value = { key: value.key, id: value.id }
	if (tabsOverlow.value) tabRefs.get(value.key).scrollIntoView({ inline: 'center', behavior: 'smooth' })
}
</script>

<style scoped lang="scss">
.content {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	overflow: hidden;

	&_header {
		position: relative;
		display: flex;
		gap: var(--td-comp-paddingLR-s);
		padding: 0 calc(120px + var(--td-comp-paddingLR-m)) 0 var(--td-comp-paddingLR-m);
		border-bottom: 1px solid var(--td-component-stroke);
		-webkit-app-region: drag;

		&::after {
			content: '';
			position: absolute;
			right: 0;
			top: 0;
			width: 120px;
			height: 30px;
			-webkit-app-region: no-drag;
		}

		&_prefix,
		&_suffix {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: var(--td-comp-paddingTB-m);
			height: 24px;
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
				width: 24px;
			}
		}

		&_center {
			flex: 1;
			display: flex;
			gap: var(--td-comp-margin-xs);
			height: 33px;
			margin: var(--td-comp-paddingTB-m) 0 -1px 0;
			padding: 0 var(--td-radius-medium);
			overflow: auto hidden;
		}

		.tab {
			position: relative;
			display: flex;
			align-items: center;
			width: 130px;
			background-color: transparent;
			border-width: 1px 1px 0 1px;
			border-color: transparent;
			border-style: solid;
			border-top-left-radius: var(--td-radius-medium);
			border-top-right-radius: var(--td-radius-medium);
			padding: 0 var(--td-comp-paddingTB-s);
			cursor: pointer;
			transition: all var(--td-transition);
			-webkit-app-region: no-drag;
			--ripple-color: var(--td-bg-color-secondarycontainer-active);

			&.is-actived {
				background-color: var(--td-bg-color-container);
				border-color: var(--td-component-stroke);

				.tab_label_text {
					color: var(--td-text-color-primary);
				}

				&::before {
					box-shadow:
						inset 0 0 0 1px var(--td-component-stroke),
						0 0 0 calc(var(--td-radius-medium) * 4) var(--td-bg-color-container);
				}

				&::after {
					box-shadow:
						inset 0 0 0 1px var(--td-component-stroke),
						0 0 0 calc(var(--td-radius-medium) * 4) var(--td-bg-color-container);
				}
			}

			&::before {
				content: '';
				position: absolute;
				left: calc(-2 * var(--td-radius-medium));
				bottom: 0;
				border-radius: 100%;
				background-color: transparent;
				width: calc(2 * var(--td-radius-medium));
				height: calc(2 * var(--td-radius-medium));
				transition: all var(--td-transition);
				clip-path: inset(50% calc(0px - 2 * var(--td-radius-medium)) 0 50%);
			}

			&::after {
				content: '';
				position: absolute;
				right: calc(-2 * var(--td-radius-medium));
				bottom: 0;
				border-radius: 100%;
				background-color: transparent;
				width: calc(2 * var(--td-radius-medium));
				height: calc(2 * var(--td-radius-medium));
				transition: all var(--td-transition);
				clip-path: inset(50% 50% 0 calc(var(--td-radius-medium) * -1));
			}

			&:not(.is-actived):hover {
				background-color: var(--td-bg-color-secondarycontainer-hover);
			}

			&_label {
				flex: 1;
				display: flex;
				align-items: center;
				gap: var(--td-comp-margin-s);
				overflow: hidden;

				svg {
					color: var(--td-brand-color);
				}

				&_text {
					flex: 1;
					font: var(--td-font-body-medium);
					color: var(--td-text-color-secondary);
					text-align: start;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					transition: all var(--td-transition);
				}
			}

			&_close {
				height: 16px;
				color: var(--td-text-color-secondary);
				transition: all var(--td-transition);

				&:hover {
					color: var(--td-error-color);
				}
			}
		}
	}

	&_body {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: var(--td-bg-color-container);
	}

	&_empty {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		background-color: var(--td-bg-color-container);
	}
}

.tabs-leave-animate {
	transition: all var(--td-transition);
	position: absolute !important;
}
</style>
