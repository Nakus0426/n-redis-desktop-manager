<template>
	<div class="main-layout" :class="layoutClass">
		<div class="sider">
			<div class="sider_header">
				<Icon height="24" width="24" icon="custom-logo" />
			</div>
			<div class="sider_body">
				<TTooltip content="连接" placement="right" :show-arrow="false">
					<div
						v-ripple
						class="sider_body_item"
						:class="menuClass(ConnectionsIndexRoute.path)"
						@click="handleMenuClick(ConnectionsIndexRoute)"
					>
						<Icon height="24" width="24" :icon="connectionIcon" />
					</div>
				</TTooltip>
				<TTooltip content="终端" :class="menuClass(TerminalIndexRoute.path)" placement="right" :show-arrow="false">
					<div v-ripple class="sider_body_item" @click="handleMenuClick(TerminalIndexRoute)">
						<Icon height="24" width="24" :icon="terminalIcon" />
					</div>
				</TTooltip>
			</div>
			<div class="sider_footer">
				<TDropdown placement="right-top">
					<div v-ripple class="sider_body_item">
						<Icon height="24" width="24" icon="fluent:text-align-justify-24-filled" />
					</div>
					<TDropdownMenu>
						<TDropdownItem @click="handleExtraMenuClick(0)">
							<template #prefixIcon><Icon height="16" width="16" icon="fluent:question-circle-16-regular" /></template>
							<span>帮助</span>
						</TDropdownItem>
						<TDropdownItem @click="handleExtraMenuClick(1)">
							<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-16-regular" /></template>
							<span>设置</span>
						</TDropdownItem>
						<TDropdownItem @click="handleExtraMenuClick(2)">
							<template #prefixIcon><Icon height="16" width="16" icon="fluent:info-16-regular" /></template>
							<span>关于</span>
						</TDropdownItem>
					</TDropdownMenu>
				</TDropdown>
			</div>
		</div>
		<div class="content">
			<div class="content_body">
				<RouterView>
					<template #default="{ Component }">
						<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in">
							<component :is="Component" />
						</Transition>
					</template>
				</RouterView>
			</div>
		</div>
		<WindowActionsOverlay window="mainWindow" />
	</div>
</template>

<script setup lang="ts">
import { type RouteRecordRaw } from 'vue-router'
import { useWindowShortcut } from '@/hooks'
import { useAppStore } from '@/store'
import { ConnectionsIndexRoute, TerminalIndexRoute } from '@/router'

defineOptions({ name: 'Layout' })

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

// init main window shortcut
useWindowShortcut('mainWindow')

// mica effect
const layoutClass = computed(() => (appStore.micaEnable ? 'main-layout-mica' : ''))

// handling menu click events
function handleMenuClick(route: RouteRecordRaw) {
	router.push(route)
}

//  is menu activated
function isMenuActived(path: string) {
	return route.path === path
}

// generate menu icon
const connectionIcon = computed(() =>
	isMenuActived(ConnectionsIndexRoute.path) ? 'fluent:link-square-24-filled' : 'fluent:link-square-24-regular',
)
const terminalIcon = computed(() =>
	isMenuActived(TerminalIndexRoute.path) ? 'fluent:window-console-20-filled' : 'fluent:window-console-20-regular',
)

// generate menu class
function menuClass(path: string) {
	return isMenuActived(path) ? 'is-actived' : ''
}

// handling extra menu click events
function handleExtraMenuClick(index: number) {
	if (index === 1) window.mainWindow.openSettingWindow()
}
</script>

<style scoped lang="scss">
.main-layout {
	width: 100%;
	height: 100%;
	display: flex;
	overflow: hidden;
	background-color: var(--td-bg-color-secondarycontainer);

	&-mica {
		background-color: transparent;
	}
}

.sider {
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-m);
	padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-s);
	-webkit-app-region: drag;

	&_header {
		display: flex;
		justify-content: center;
	}

	&_body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--td-comp-margin-m);

		&_item {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 40px;
			width: 40px;
			color: var(--td-text-color-primary);
			border-radius: var(--td-radius-medium);
			transition: all var(--td-transition);
			cursor: pointer;
			-webkit-app-region: no-drag;
			--ripple-color: var(--td-bg-color-secondarycontainer-active);

			&.is-actived {
				background-color: var(--td-bg-color-container);
				color: var(--td-brand-color);

				&::before {
					content: '';
					position: absolute;
					top: 12.5px;
					left: -1.5px;
					height: 15px;
					width: 3px;
					border-radius: 2px;
					transition: all var(--td-transition);
					background-color: var(--td-brand-color);
					z-index: 1;
				}
			}

			&:not(.is-actived):hover {
				background-color: var(--td-bg-color-secondarycontainer-hover);
			}

			&::before {
				content: '';
				height: 0;
				transition: all var(--td-transition);
			}
		}
	}

	&_footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--td-comp-margin-m);
	}

	[theme-mode='dark'] {
		.sider_body_item {
			--ripple-color: var();
		}
	}
}

.content {
	flex: 1;
	overflow: hidden;

	&_body {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
}
</style>
