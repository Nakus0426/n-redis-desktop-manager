<template>
	<ContainerWithSider class="links">
		<template #sider>
			<div class="links_header">
				<TInput></TInput>
				<TButton variant="dashed" theme="default">
					<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
				</TButton>
			</div>
		</template>
		<h1>Linkss</h1>
	</ContainerWithSider>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.links_header {
	display: flex;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-m);
	-webkit-app-region: drag;

	div,
	button {
		-webkit-app-region: no-drag;
	}
}
</style>
