<template>
	<div class="connections">
		<div class="header">
			<TButton variant="dashed" size="small" @click="handleCreateConnectionCick()">
				<template #icon><Icon height="16" width="16" icon="fluent:add-16-regular" /></template>
				<span>新建连接</span>
			</TButton>
			<div class="tabs" :class="{ 'is-overflow': isTabsOverflow }" ref="tabsRef">
				<div class="tabs_prefix" v-ripple @click="handleTabsScrollClick('pre')">
					<Icon height="12" width="12" icon="fluent:chevron-left-12-regular" />
				</div>
				<div class="tabs_center" ref="tabsCenterRef" id="tabs">
					<TransitionGroup name="tab">
						<template v-for="(item, index) in tabs" :key="item.key">
							<div
								class="tab"
								:class="{ 'is-actived': item.isActived }"
								v-ripple
								ref="tabRefs"
								@click="handleTabClick(index, item)"
							>
								<Icon height="16" width="16" :icon="item.icon" />
								<TextEllipsis class="tab_label" :content="item.title" />
								<TTooltip content="关闭" theme="light" :show-arrow="false" placement="bottom">
									<Icon
										class="tab_close"
										height="12"
										width="12"
										icon="fluent:dismiss-12-regular"
										@click.stop="handleTabRemoveClick(item.id, item.key)"
									/>
								</TTooltip>
							</div>
						</template>
					</TransitionGroup>
				</div>
				<div class="tabs_suffix" v-ripple @click="handleTabsScrollClick('next')">
					<Icon height="12" width="12" icon="fluent:chevron-right-12-regular" />
				</div>
			</div>
		</div>
		<div class="body">
			<div class="sider" ref="siderRef">
				<Sider @edit="handleEditClick" />
			</div>
			<div class="content" ref="contentRef">content</div>
		</div>
		<ConnectionEditDialog ref="connectionEditDialogRef" />
	</div>
</template>

<script setup lang="ts">
import Split from 'split.js'
import { useResizeObserver } from '@vueuse/core'
import Sider from './sider/Index.vue'
import ConnectionEditDialog from './ConnectionEditDialog.vue'
import { type Tab, useTabs } from './hooks'

const { tabs, activedTab, removeTab } = useTabs()

// panel split
const siderRef = ref()
const contentRef = ref()
onMounted(() =>
	Split([siderRef.value, contentRef.value], { sizes: [30, 70], minSize: [300, 300], gutterSize: 5, expandToMin: true }),
)

// ceate connection
const connectionEditDialogRef = ref<InstanceType<typeof ConnectionEditDialog>>()
function handleCreateConnectionCick() {
	connectionEditDialogRef.value.open()
}

// edit connection
function handleEditClick(id: string) {
	connectionEditDialogRef.value.open(id)
}

// tabs scroll
const tabsCenterRef = ref<HTMLElement>()
const tabRefs = ref<HTMLElement[]>([])
function handleTabsScrollClick(direction: 'pre' | 'next') {
	const tabsWidth = tabsCenterRef.value.offsetWidth
	const tabsScrollLeft = tabsCenterRef.value.scrollLeft
	const tabsItemWidth = tabRefs.value[0].offsetWidth
	const tabsItemMarginLeft = parseInt(getComputedStyle(tabRefs.value[0]).marginLeft)
	const tabsItemMarginRight = parseInt(getComputedStyle(tabRefs.value[0]).marginRight)
	const tabsItemTotalWidth = tabsItemWidth + tabsItemMarginLeft + tabsItemMarginRight
	const tabsItemTotalCount = tabRefs.value.length
	const tabsItemVisibleCount = Math.floor(tabsWidth / tabsItemTotalWidth)
	const tabsItemScrollCount = tabsItemTotalCount - tabsItemVisibleCount
	const tabsItemScrollWidth = tabsItemScrollCount * tabsItemTotalWidth
	if (direction === 'pre' && tabsScrollLeft > 0)
		tabsCenterRef.value.scrollTo({ left: tabsScrollLeft - tabsItemTotalWidth * 3, behavior: 'smooth' })
	if (direction === 'next' && tabsScrollLeft < tabsItemScrollWidth)
		tabsCenterRef.value.scrollTo({ left: tabsScrollLeft + tabsItemTotalWidth * 3, behavior: 'smooth' })
}

// is tabs overflow
const isTabsOverflow = ref(false)
const tabsRef = ref<HTMLElement>()
async function calcTabsOverflow() {
	await nextTick()
	isTabsOverflow.value = tabsCenterRef.value.scrollWidth > tabsCenterRef.value.clientWidth
}
useResizeObserver(tabsCenterRef, calcTabsOverflow)
watch(() => tabs.value.length, calcTabsOverflow, { immediate: true })

// tab click
function handleTabClick(index: number, tab: Tab) {
	activedTab.value = tab
}

// tab remove
function handleTabRemoveClick(id: string, key: string) {
	removeTab(id, key)
}

// tab scroll into view
watch(activedTab, async value => {
	await nextTick()
	if (!value || !isTabsOverflow.value) return
	const index = tabs.value.findIndex(item => item.id === value.id && item.key === value.key)
	if (index !== -1) setTimeout(() => tabScrollIntoView(index), 200)
})
function tabScrollIntoView(index: number) {
	tabRefs.value[index].scrollIntoView({ behavior: 'smooth', inline: 'center' })
}
</script>

<style scoped lang="scss">
.connections {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
}

.header {
	position: relative;
	height: 40px;
	display: flex;
	gap: var(--td-comp-margin-m);
	padding-right: 120px;
	-webkit-app-region: drag;

	:deep(.t-button) {
		width: 300px;
		margin-top: 11px;
		-webkit-app-region: no-drag;
	}

	&::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 120px;
		height: 30px;
		-webkit-app-region: no-drag;
	}

	.tabs {
		height: 30px;
		flex: 1;
		display: flex;
		margin-top: 11px;
		padding: 0 var(--td-radius-medium);
		overflow: hidden;

		&.is-overflow {
			.tabs_prefix,
			.tabs_suffix {
				width: 24px;
			}

			.tabs_center {
				mask-image: linear-gradient(90deg, transparent, #000 8px, #000 calc(100% - 8px), transparent 100%);
			}
		}

		&_prefix,
		&_suffix {
			height: 24px;
			width: 0px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: var(--td-radius-default);
			color: var(--td-text-color-secondary);
			cursor: pointer;
			transition: all var(--td-transition);
			-webkit-app-region: no-drag;
			--ripple-color: var(--td-bg-color-secondarycontainer-active);

			&:hover {
				color: var(--td-text-color-primary);
				background-color: var(--td-bg-color-secondarycontainer-hover);
			}
		}

		&_center {
			flex: 1;
			display: flex;
			gap: var(--td-comp-margin-xs);
			padding: 0 var(--td-comp-margin-s);
			overflow: auto hidden;

			.tab {
				position: relative;
				display: flex;
				align-items: center;
				gap: var(--td-comp-margin-xs);
				width: 130px;
				min-width: 130px;
				background-color: transparent;
				color: var(--td-text-color-secondary);
				border-width: 1px 1px 0 1px;
				border-color: transparent;
				border-style: solid;
				border-top-left-radius: var(--td-radius-large);
				border-top-right-radius: var(--td-radius-large);
				padding: 0 var(--td-comp-paddingTB-s);
				cursor: pointer;
				transition: all var(--td-transition);
				-webkit-app-region: no-drag;
				--ripple-color: var(--td-bg-color-secondarycontainer-active);

				&.is-actived {
					background-color: var(--td-bg-color-container);
					border-color: var(--td-component-stroke);
					color: var(--td-text-color-primary);

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
					width: calc(2 * var(--td-radius-medium));
					height: calc(2 * var(--td-radius-medium));
					border-radius: 100%;
					background-color: transparent;
					transition: all var(--td-transition);
					clip-path: inset(50% calc(0px - 2 * var(--td-radius-medium)) 0 50%);
				}

				&::after {
					content: '';
					position: absolute;
					right: calc(-2 * var(--td-radius-medium));
					bottom: 0;
					width: calc(2 * var(--td-radius-medium));
					height: calc(2 * var(--td-radius-medium));
					border-radius: 100%;
					background-color: transparent;
					transition: all var(--td-transition);
					clip-path: inset(50% 50% 0 calc(var(--td-radius-medium) * -1));
				}

				&:not(.is-actived):hover {
					background-color: var(--td-bg-color-secondarycontainer-hover);
				}

				&_label {
					flex: 1;
					font: var(--td-font-body-medium);
				}

				&_close {
					transition: all var(--td-transition);

					&:hover {
						color: var(--td-error-color);
					}
				}
			}
		}
	}
}

.body {
	flex: 1;
	display: flex;
	background-color: var(--td-bg-color-container);
	border-top-left-radius: var(--td-radius-large);
	border-top: 1px solid var(--td-component-stroke);
	border-left: 1px solid var(--td-component-stroke);
	overflow: hidden;
}

.tab-enter-active,
.tab-leave-active,
.tab-move {
	transition: all var(--td-transition);
}

.tab-enter-from,
.tab-leave-to {
	opacity: 0;
	transform: translateY(5px);
}
</style>
