<template>
	<ContainerWithSider class="links">
		<template #sider><Sider @link-change="handleLinkChange" @key-change="handleKeyChange" /></template>
		<div class="content">
			<div class="content_header">123</div>
			<div class="content_body">
				<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in" appear>
					<component :is="component" />
				</Transition>
			</div>
			<!-- <Empty description="请先选择一个连接" size="large"/> -->
		</div>
	</ContainerWithSider>
</template>

<script setup lang="ts">
import Sider from './Sider.vue'
import Overview from './Overview.vue'
import KeyEdit from './KeyEdit.vue'

const activedComponent = ref<'Overview' | 'KeyEdit'>('Overview')
const componentsMap = { Overview, KeyEdit }
const component = computed(() => componentsMap[activedComponent.value])

// handle link change
function handleLinkChange(id: string) {
	activedComponent.value = 'Overview'
}

// handle key change
function handleKeyChange(key: string) {
	activedComponent.value = 'KeyEdit'
}
</script>

<style scoped lang="scss">
.content {
	display: flex;
	flex-direction: column;
	height: 100%;

	&:has(> .empty) {
		align-items: center;
		justify-content: center;
	}

	&_header {
		margin-right: 120px;
		padding: var(--window-action-height) var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m)
			var(--td-comp-paddingLR-m);
		font: var(--td-font-title-medium);
		color: var(--td-text-color-primary);
		-webkit-app-region: drag;
	}

	&_body {
		flex: 1;
		border-top: 1px solid var(--td-component-border);
	}
}
</style>
