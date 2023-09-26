<template>
	<div class="setting">
		<WindowActionsOverlay :window-api="windowApi" :maximizable="false" />
		<div class="sider">
			<div
				v-ripple
				class="sider_item"
				:class="menuClass(CommonSettingRoute.path)"
				@click="handleMenuClick(CommonSettingRoute)"
			>
				<Icon height="16" width="16" :icon="commonIcon" />
				<div>{{ t('setting.common.title') }}</div>
			</div>
			<div
				v-ripple
				class="sider_item"
				:class="menuClass(AppearanceSettingRoute.path)"
				@click="handleMenuClick(AppearanceSettingRoute)"
			>
				<Icon height="16" width="16" :icon="appearanceIcon" />
				<div>{{ t('setting.appearance.title') }}</div>
			</div>
		</div>
		<div class="body">
			<div class="body_header">{{ title }}</div>
			<div class="body_content" id="bodyContent">
				<RouterView>
					<template #default="{ Component }">
						<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in" appear>
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
import { useI18n } from 'vue-i18n'
import { RouteRecordRaw } from 'vue-router'
import { OverlayScrollbars } from 'overlayscrollbars'

defineOptions({ name: 'Setting' })

const windowApi = window.settingWindow
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// scroll bar
onMounted(() => {
	OverlayScrollbars(document.getElementById('bodyContent'), {
		overflow: { x: 'hidden', y: 'scroll' },
		scrollbars: { autoHide: 'leave' },
	})
})

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
const commonIcon = computed(() =>
	isMenuActived(CommonSettingRoute.path) ? 'fluent:options-16-filled' : 'fluent:options-16-regular'
)
const appearanceIcon = computed(() =>
	isMenuActived(AppearanceSettingRoute.path) ? 'fluent:color-16-filled' : 'fluent:color-16-regular'
)
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
	background-color: var(--td-bg-color-container);
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
		transition: background-color var(--td-transition);
		cursor: pointer;
		-webkit-app-region: no-drag;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&.is-actived {
			background-color: var(--td-bg-color-container-active);
			color: var(--td-brand-color);
		}
	}
}

.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: var(--td-bg-color-page);

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
		overflow: hidden;
	}
}
</style>

<style lang="scss">
.cell {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);

	&_title {
		font: var(--td-font-body-medium);
		color: var(--td-text-color-secondary);
	}

	&_content {
		display: flex;
		border-radius: var(--td-radius-medium);
		background-color: var(--td-bg-color-container);
		padding: var(--td-comp-paddingTB-m);

		&-horizontal {
			flex-direction: row;
			gap: var(--td-comp-margin-m);
		}

		&-vertical {
			flex-direction: column;
		}

		&_item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: var(--td-comp-margin-m);
			font: var(--td-font-body-medium);
			color: var(--td-text-color-primary);
			padding: var(--td-comp-paddingTB-m) 0;

			&:first-child {
				padding-top: 0;
			}

			&:last-child {
				padding-bottom: 0;
			}

			&:not(:last-child) {
				border-bottom: 1px solid var(--td-component-stroke);
			}

			&_label {
				display: flex;
				flex-direction: column;

				&_title {
					font: var(--td-font-body-medium);
					color: var(--td-text-color-primary);
				}

				&_desc {
					font: var(--td-font-body-small);
					color: var(--td-text-color-secondary);
				}
			}

			&_value {
				display: flex;
				justify-content: flex-end;
			}
		}
	}
}
</style>
