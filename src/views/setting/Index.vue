<template>
	<div class="setting">
		<WindowActionsOverlay :window-api="windowApi" :maximizable="false" />
		<div class="sider">
			<div class="sider_item is-actived">
				<Icon height="16" width="16" icon="fluent:options-20-regular" />
				<div>通用</div>
			</div>
			<div class="sider_item">
				<Icon height="16" width="16" icon="fluent:color-20-regular" />
				<div>外观</div>
			</div>
		</div>
		<div class="body"></div>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Setting' })

const windowApi = window.settingWindow
</script>

<style scoped lang="scss">
.setting {
	height: 100%;
	width: 100%;
}

.sider {
	height: 100%;
	width: 20%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	background-color: var(--td-bg-color-secondarycontainer);
	border-right: 1px solid var(--td-component-stroke);
	padding: var(--td-comp-paddingLR-m);
	-webkit-app-region: drag;

	&_item {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		font: var(--td-font-body-medium);
		color: var(--td-text-color-primary);
		padding: var(--td-comp-paddingTB-xs);
		border-radius: var(--td-radius-medium);
		transition: all var(--td-transition);
		cursor: pointer;
		-webkit-app-region: no-drag;

		&:hover {
			background-color: var(--td-bg-color-secondarycontainer-hover);
		}

		&:active {
			background-color: var(--td-bg-color-secondarycontainer-active);
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
</style>
