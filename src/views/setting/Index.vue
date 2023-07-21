<template>
	<div class="setting">
		<WindowActionsOverlay :window-api="windowApi" :maximizable="false" />
		<div class="sider">
			<div
				v-ripple
				class="sider_item"
				:class="isMenuActived(CommonSettingRoute.path)"
				@click="handleMenuClick(CommonSettingRoute)"
			>
				<Icon height="16" width="16" icon="fluent:options-20-regular" />
				<div>通用</div>
			</div>
			<div
				v-ripple
				class="sider_item"
				:class="isMenuActived(AppearanceSettingRoute.path)"
				@click="handleMenuClick(AppearanceSettingRoute)"
			>
				<Icon height="16" width="16" icon="fluent:color-20-regular" />
				<div>外观</div>
			</div>
		</div>
		<div class="body">
			<div class="body_header">11111</div>
			<div class="body_content">
				<RouterView>
					<template #default="{ Component }">
						<Transition name="zoom-fade" mode="out-in" appear>
							<component :is="Component" />
						</Transition>
					</template>
				</RouterView>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CommonSettingRoute, AppearanceSettingRoute } from '@/router'
import { RouteRecordRaw } from 'vue-router'

defineOptions({ name: 'Setting' })

const windowApi = window.settingWindow
const router = useRouter()
const route = useRoute()

// handling menu click events
function handleMenuClick(route: RouteRecordRaw) {
	router.push(route)
}

// determine if the menu is activated
function isMenuActived(path: string) {
	return route.path === path ? 'is-actived' : ''
}
</script>

<style scoped lang="scss">
.setting {
	height: 100%;
	width: 100%;
	display: flex;
}

.sider {
	height: 100%;
	width: 20%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	background-color: var(--td-bg-color-secondarycontainer);
	border-right: 1px solid var(--td-component-stroke);
	padding: var(--td-comp-paddingLR-s);
	-webkit-app-region: drag;

	&_item {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		font: var(--td-font-body-medium);
		color: var(--td-text-color-primary);
		padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingTB-s);
		border-radius: var(--td-radius-medium);
		transition: all var(--td-transition);
		cursor: pointer;
		-webkit-app-region: no-drag;
		--ripple-color: var(--td-bg-color-secondarycontainer-active);

		&:hover {
			background-color: var(--td-bg-color-secondarycontainer-hover);
		}

		&.is-actived {
			color: var(--td-brand-color);
			background-color: var(--td-bg-color-secondarycontainer-active);

			&:hover {
				background-color: var(--td-bg-color-secondarycontainer-active);
			}
		}
	}
}

.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: var(--td-bg-color-component);

	&_header {
		padding: var(--td-comp-paddingTB-m);
		margin-right: 80px;
		font: var(--td-font-body-large);
		color: var(--td-text-color-primary);
		-webkit-app-region: drag;
	}

	&_content {
		flex: 1;
		border-top: 1px solid var(--td-component-border);
	}
}
</style>
