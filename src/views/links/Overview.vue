<template>
	<div class="overview">
		<div class="header">
			<div class="header_item">
				<div class="header_item_header">
					<Icon height="16" width="16" icon="fluent:server-20-regular" />
					<div class="header_item_header_title">服务器</div>
				</div>
				<div class="header_item_body">123</div>
			</div>
		</div>
		<h1>Overview</h1>
	</div>
</template>

<script setup lang="ts">
defineOptions({ name: 'Overview' })
</script>

<style scoped lang="scss">
.overview {
	display: flex;
	flex-direction: column;
	padding: var(--td-comp-paddingLR-m);
}

.header {
	display: flex;
	gap: var(--td-comp-margin-m);

	&_item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--td-comp-paddingTB-xs);

		&_header {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-xs);

			&_title {
				font: var(--td-font-body-medium);
				color: var(--td-text-color-secondary);
			}

			svg {
				color: var(--td-brand-color);
			}
		}

		&_body {
			flex: 1;
			background-color: var(--td-bg-color-container);
			border-radius: var(--td-radius-medium);
		}
	}
}
</style>
