<template>
	<div class="menu">
		<div class="header"></div>
		<div class="body">
			<TTooltip content="连接" placement="right" :show-arrow="false">
				<div class="menu_item" :class="isMenuActived(LinksIndexRoute.path)" @click="handleLinksMenuClick()">
					<Icon height="24" width="24" icon="fluent:link-square-20-regular" />
				</div>
			</TTooltip>
			<TTooltip content="终端" :class="isMenuActived(TerminalIndexRoute.path)" placement="right" :show-arrow="false">
				<div class="menu_item" @click="hanldeTerminalMenuClick()">
					<Icon height="24" width="24" icon="fluent:code-block-20-regular" />
				</div>
			</TTooltip>
		</div>
		<div class="footer">
			<TDropdown placement="right-top" trigger="click">
				<div class="menu_item">
					<Icon height="24" width="24" icon="fluent:text-align-justify-20-filled" />
				</div>
				<TDropdownMenu>
					<TDropdownItem>
						<template #prefixIcon><Icon height="16" width="16" icon="fluent:chat-help-20-regular" /></template>
						<span>帮助</span>
					</TDropdownItem>
					<TDropdownItem>
						<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-20-regular" /></template>
						<span>设置</span>
					</TDropdownItem>
					<TDropdownItem>
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

const router = useRouter()

// Handling links menu click events
function handleLinksMenuClick() {
	router.push('/links')
}

// Handling terminal menu click events
function hanldeTerminalMenuClick() {
	router.push('/terminal')
}

// Determine if the menu is activated
function isMenuActived(path: string) {
	return router.currentRoute.value.path === path ? 'is-actived' : ''
}
</script>

<style scoped lang="scss">
.menu {
	height: 100%;
	width: 50px;
	display: flex;
	flex-direction: column;
	background-color: var(--td-bg-color-secondarycontainer);
	border-right: 1px solid var(--td-component-stroke);
	padding: var(--td-comp-paddingTB-m) 0;
	-webkit-app-region: drag;
}

.menu_item {
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

	&.is-actived {
		color: var(--td-brand-color);
		background-color: var(--td-bg-color-secondarycontainer-active);

		&:hover {
			background-color: var(--td-bg-color-secondarycontainer-active);
		}
	}

	&:hover {
		background-color: var(--td-bg-color-secondarycontainer-hover);
	}

	&:active {
		background-color: var(--td-bg-color-secondarycontainer-active);
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
