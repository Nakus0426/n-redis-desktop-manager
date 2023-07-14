<template>
	<div class="content">
		<div class="header">
			<div class="header_center"></div>
			<div class="header_suffix">
				<div class="header_suffix_item" @click="handleMinimizeClick()">
					<Icon height="16" width="16" icon="fluent:subtract-20-regular" />
				</div>
				<div class="header_suffix_item"><Icon height="16" width="16" icon="fluent:maximize-20-regular" /></div>
				<div class="header_suffix_item exit"><Icon height="16" width="16" icon="fluent:dismiss-20-regular" /></div>
			</div>
		</div>
		<div class="body"></div>
	</div>
</template>

<script setup lang="ts">
function handleMinimizeClick() {
  window['mainWindow'].test()
}
</script>

<style scoped lang="scss">
.content {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.header {
	display: flex;
	height: 30px;

	&_center {
		flex: 1;
		-webkit-app-region: drag;
	}

	&_suffix {
		height: 100%;
		display: flex;
		justify-content: flex-end;

		&_item {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 40px;
			color: var(--td-text-color-primary);
			cursor: pointer;
			transition: all var(--td-transition);

			&.exit {
				&:hover {
					background-color: var(--td-error-color);
					color: #ffffff;
				}

				&:active {
					background-color: var(--td-error-color-active);
				}
			}

			&:hover {
				background-color: var(--td-bg-color-container-hover);
			}

			&:active {
				background-color: var(--td-bg-color-container-active);
			}
		}
	}
}

.body {
	flex: 1;
}
</style>
