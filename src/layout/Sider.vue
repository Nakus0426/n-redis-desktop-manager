<template>
	<div class="sider">
		<div class="header">
			<img class="header_logo" src="@/assets/icons/logo.svg" />
		</div>
		<div class="body">
			<TTooltip content="连接" placement="right" :show-arrow="false">
				<div
					v-ripple
					class="menu_item"
					:class="menuClass(LinksIndexRoute.path)"
					@click="handleMenuClick(LinksIndexRoute)"
				>
					<Icon height="24" width="24" :icon="linkIcon" />
				</div>
			</TTooltip>
			<TTooltip content="终端" :class="menuClass(TerminalIndexRoute.path)" placement="right" :show-arrow="false">
				<div v-ripple class="menu_item" @click="handleMenuClick(TerminalIndexRoute)">
					<Icon height="24" width="24" :icon="terminalIcon" />
				</div>
			</TTooltip>
		</div>
		<div class="footer">
			<TDropdown placement="right-top">
				<div v-ripple class="menu_item">
					<Icon height="24" width="24" icon="fluent:text-align-justify-20-filled" />
				</div>
				<TDropdownMenu>
					<TDropdownItem @click="handleExtraMenuClick(0)">
						<template #prefixIcon><Icon height="16" width="16" icon="fluent:chat-help-20-regular" /></template>
						<span>帮助</span>
					</TDropdownItem>
					<TDropdownItem @click="handleExtraMenuClick(1)">
						<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-20-regular" /></template>
						<span>设置</span>
					</TDropdownItem>
					<TDropdownItem @click="handleExtraMenuClick(2)">
						<template #prefixIcon><Icon height="16" width="16" icon="fluent:info-20-regular" /></template>
						<span>关于</span>
					</TDropdownItem>
				</TDropdownMenu>
			</TDropdown>
		</div>
	</div>
</template>

<script setup lang="ts">
import { LinksIndexRoute, TerminalIndexRoute } from '@/router'
import { RouteRecordRaw } from 'vue-router'

defineOptions({ name: 'Sider' })

const router = useRouter()
const route = useRoute()

// handling menu click events
function handleMenuClick(route: RouteRecordRaw) {
	router.push(route)
}

//  is menu activated
function isMenuActived(path: string) {
	return route.path === path
}

// generate menu icon
const linkIcon = computed(() =>
	isMenuActived(LinksIndexRoute.path) ? 'fluent:link-square-20-filled' : 'fluent:link-square-20-regular'
)
const terminalIcon = computed(() =>
	isMenuActived(TerminalIndexRoute.path) ? 'fluent:code-block-20-filled' : 'fluent:code-block-20-regular'
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
.sider {
	height: 100%;
	width: 60px;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-m);
	background-color: var(--td-bg-color-secondarycontainer);
	border-right: 1px solid var(--td-component-stroke);
	padding: var(--window-action-height) 0 var(--td-comp-paddingTB-m) 0;
	-webkit-app-region: drag;
}

.header {
	display: flex;
	justify-content: center;

	&_logo {
		height: 30px;
		width: 30px;
	}
}

.menu_item {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 40px;
	width: 40px;
	color: var(--td-text-color-primary);
	border-radius: var(--td-radius-medium);
	transition: background-color var(--td-transition);
	cursor: pointer;
	-webkit-app-region: no-drag;
	--ripple-color: var(--td-bg-color-secondarycontainer-active);

	&.is-actived {
		background-color: var(--td-bg-color-container-active);
		color: var(--td-brand-color);

		&:hover {
			background-color: var(--td-bg-color-container-active);
		}
	}

	&:hover {
		background-color: var(--td-bg-color-secondarycontainer-hover);
	}
}

.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--td-comp-margin-m);
}

.footer {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--td-comp-margin-m);
}
</style>
