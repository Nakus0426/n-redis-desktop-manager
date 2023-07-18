<template>
	<ContainerWithSider class="links">
		<template #sider>
			<div class="links_header">
				<TInput size="small"></TInput>
				<TButton variant="dashed" theme="default" size="small" @click="handleAddClick()">
					<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
				</TButton>
			</div>
		</template>
		<h1>Linkss</h1>
	</ContainerWithSider>
</template>

<script setup lang="ts">
function handleAddClick() {
	window.mainWindow.createChildWindow({ path: '/child' })
}
</script>

<style scoped lang="scss">
.links_header {
	display: flex;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-m);
	border-bottom: 1px solid var(--td-component-stroke);
	-webkit-app-region: drag;

	div,
	button {
		-webkit-app-region: no-drag;
	}
}
</style>
