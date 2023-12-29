<template>
	<div class="connections">
		<div class="header">
			<TButton variant="dashed" size="small" @click="handleCreateConnectionCick()">
				<template #icon><Icon height="14" width="14" icon="fluent:add-12-filled" /></template>
				<span>新建连接</span>
			</TButton>
			<div class="tabs">
				<div class="tabs_prefix" v-ripple>
					<Icon height="14" width="14" icon="fluent:chevron-left-16-filled" />
				</div>
				<div class="tabs_center">
					<div class="tab" v-for="item in 20" :class="item === 1 ? 'is-actived' : null" v-ripple>
						<span class="tab_label">{{ item }}</span>
						<Icon class="tab_close" height="14" width="14" icon="fluent:dismiss-16-regular" />
					</div>
				</div>
				<div class="tabs_suffix" v-ripple>
					<Icon height="14" width="14" icon="fluent:chevron-right-16-filled" />
				</div>
			</div>
		</div>
		<div class="body">
			<div class="sider" ref="siderRef">
				<Sider />
			</div>
			<div class="content" ref="contentRef">content</div>
		</div>
	</div>
	<ConnectionEditDialog ref="connectionEditDialogRef" />
</template>

<script setup lang="ts">
import Split from 'split.js'
import Sider from './Sider.vue'
import ConnectionEditDialog from './ConnectionEditDialog.vue'

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
		gap: var(--td-comp-margin-s);
		margin-top: 11px;
		padding: 0 var(--td-radius-medium);
		overflow: hidden;

		&_prefix,
		&_suffix {
			height: 24px;
			width: 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: var(--td-radius-default);
			color: var(--td-text-color-primary);
			cursor: pointer;
			-webkit-app-region: no-drag;
			--ripple-color: var(--td-bg-color-secondarycontainer-active);

			&:hover {
				background-color: var(--td-bg-color-secondarycontainer-hover);
			}
		}

		&_center {
			flex: 1;
			display: flex;
			gap: var(--td-comp-margin-xs);
			overflow: auto hidden;

			.tab {
				position: relative;
				display: flex;
				align-items: center;
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
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
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
	overflow: hidden;
}
</style>
