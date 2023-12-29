<template>
	<div class="setting-layout" :class="containerClass">
		<WindowOverlay window="settingWindow" :maximizable="false" />
		<div class="sider">
			<div
				v-ripple
				class="sider_item"
				:class="menuClass(CommonSettingRoute.path)"
				@click="handleMenuClick(CommonSettingRoute)"
			>
				<Icon height="16" width="16" :icon="commonIcon" />
				<div>通用</div>
			</div>
			<div
				v-ripple
				class="sider_item"
				:class="menuClass(AppearanceSettingRoute.path)"
				@click="handleMenuClick(AppearanceSettingRoute)"
			>
				<Icon height="16" width="16" :icon="appearanceIcon" />
				<div>外观</div>
			</div>
			<div
				v-ripple
				class="sider_item"
				:class="menuClass(FunctionSettingRoute.path)"
				@click="handleMenuClick(FunctionSettingRoute)"
			>
				<Icon height="16" width="16" :icon="functionIcon" />
				<div>高级</div>
			</div>
		</div>
		<div class="content">
			<div class="content_header">{{ title }}</div>
			<div class="content_body" ref="contentRef">
				<RouterView>
					<template #default="{ Component }">
						<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in">
							<component :is="Component" />
						</Transition>
					</template>
				</RouterView>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { type RouteRecordRaw } from 'vue-router'
import { AppearanceSettingRoute, CommonSettingRoute, FunctionSettingRoute } from '@/router/routes'
import { useAppStore } from '@/store/modules/app'
import { useLocale } from '@/hooks/useLocale'
import { useScrollbar } from '@/hooks/useScrollbar'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { t } = useLocale()

// mica effect
const containerClass = computed(() => (appStore.micaEnable ? 'mica' : ''))

// scroll bar
const contentRef = ref()
const { init: initScrollbar } = useScrollbar(contentRef)
onMounted(() => initScrollbar())

// title
const title = computed(() => t(route.meta.title as string))

// handling menu click events
function handleMenuClick(route: RouteRecordRaw) {
	router.push(route)
}

// determine if the menu is activated
function isMenuActived(path: string) {
	return route.path === path
}

// generate menu class
function menuClass(path: string) {
	return isMenuActived(path) ? 'is-actived' : ''
}

// generate menu icon
const commonIcon = computed(() => `fluent:options-16-${isMenuActived(CommonSettingRoute.path) ? 'filled' : 'regular'}`)
const appearanceIcon = computed(
	() => `fluent:color-16-${isMenuActived(AppearanceSettingRoute.path) ? 'filled' : 'regular'}`,
)
const functionIcon = computed(() => `fluent:apps-16-${isMenuActived(FunctionSettingRoute.path) ? 'filled' : 'regular'}`)
</script>

<style scoped lang="scss">
.setting-layout {
	width: 100%;
	height: 100%;
	display: flex;
	overflow: hidden;
	background-color: var(--td-bg-color-secondarycontainer);

	&.mica {
		background-color: transparent;
	}
}

.sider {
	width: 150px;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-s);
	-webkit-app-region: drag;

	&_item {
		position: relative;
		display: flex;
		align-items: center;
		font: var(--td-font-body-medium);
		color: var(--td-text-color-primary);
		padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
		border-radius: var(--td-radius-medium);
		transition: all var(--td-transition);
		cursor: pointer;
		-webkit-app-region: no-drag;
		--ripple-color: var(--td-bg-color-container-active);

		&:not(.is-actived):hover {
			background-color: var(--td-bg-color-secondarycontainer-hover);
		}

		&.is-actived {
			background-color: var(--td-bg-color-container);
			color: var(--td-brand-color);

			&::before {
				content: '';
				position: absolute;
				top: 7.5px;
				left: -1.5px;
				height: 15px;
				width: 3px;
				border-radius: 2px;
				transition: all var(--td-transition);
				background-color: var(--td-brand-color);
				z-index: 1;
			}
		}

		&::before {
			content: '';
			height: 0;
			transition: all var(--td-transition);
		}

		svg {
			margin-right: var(--td-comp-margin-s);
		}
	}
}

.content {
	flex: 1;
	display: flex;
	flex-direction: column;

	&_header {
		position: relative;
		font: var(--td-font-body-large);
		font-size: var(--td-font-size-title-large);
		color: var(--td-text-color-primary);
		padding: var(--td-comp-paddingTB-m) 80px var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m);
		-webkit-app-region: drag;

		&::after {
			content: '';
			position: absolute;
			right: 0;
			top: 0;
			width: 80px;
			height: 30px;
			-webkit-app-region: no-drag;
		}
	}

	&_body {
		flex: 1;
		background-color: var(--td-bg-color-container);
		border-top-left-radius: var(--td-radius-large);
		border-top: 1px solid var(--td-component-stroke);
		border-left: 1px solid var(--td-component-stroke);
	}
}
</style>
