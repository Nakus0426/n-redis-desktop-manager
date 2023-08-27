<template>
	<ContainerWithSider class="links">
		<template #sider><Sider @link-change="handleLinkChange" @key-change="handleKeyChange" /></template>
		<div class="content" :class="contentEmptyClass">
			<div class="content_header" v-show="!isEmpty">
				<TButton variant="text" theme="default" size="small" v-show="backVisible" @click="handleBackClick()">
					<template #icon><Icon height="16" width="16" icon="fluent:chevron-left-20-regular" /></template>
					<div>概览</div>
				</TButton>
				<div>{{ activedLink?.name }}</div>
			</div>
			<div class="content_body" v-show="!isEmpty">
				<OverlayScrollbarsComponent :options="{ scrollbars: { autoHide: 'leave', clickScroll: true } }" defer>
					<Transition enter-active-class="animate__animated animate__fadeInUp animate__faster" mode="out-in" appear>
						<component :is="component" />
					</Transition>
				</OverlayScrollbarsComponent>
			</div>
			<Empty description="请先选择一个连接" size="large" v-show="isEmpty" />
		</div>
	</ContainerWithSider>
</template>

<script setup lang="ts">
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import Sider from './Sider.vue'
import Overview from './Overview.vue'
import KeyEdit from './KeyEdit.vue'
import { type Link } from '@/store'

const activedComponent = ref<'Overview' | 'KeyEdit'>('Overview')
const componentsMap = { Overview, KeyEdit }
const component = computed(() => componentsMap[activedComponent.value])

// is empty
const isEmpty = computed(() => !activedLink.value)
const contentEmptyClass = computed(() => (isEmpty.value ? 'is-empty' : ''))

// back to overview
const backVisible = computed(() => activedComponent.value === 'KeyEdit')
function handleBackClick() {
	activedComponent.value = 'Overview'
}

// handle link change
const activedLink = ref<Link>()
function handleLinkChange(link: Link) {
	activedLink.value = link
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

	&.is-empty {
		align-items: center;
		justify-content: center;
	}

	&_header {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-m);
		margin-right: 120px;
		padding: var(--window-action-height) var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-s)
			var(--td-comp-paddingLR-m);
		font: var(--td-font-title-medium);
		color: var(--td-text-color-primary);
		-webkit-app-region: drag;

		button {
			-webkit-app-region: no-drag;
		}

		:deep(.t-button--variant-text) {
			--ripple-color: var(--td-bg-color-secondarycontainer-active);

			&:hover {
				background-color: var(--td-bg-color-container-active);
				border-color: var(--td-bg-color-container-active);
			}
		}
	}

	&_body {
		flex: 1;
		border-top: 1px solid var(--td-component-border);
		overflow: hidden;

		> div {
			height: 100%;
		}
	}
}
</style>
