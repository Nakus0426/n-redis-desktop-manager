<template>
	<div class="sider" id="">
		<div class="header">
			<TInput></TInput>
			<TButton variant="dashed" theme="default" @click="handleEditLinkClick()">
				<template #icon><Icon height="16" width="16" icon="fluent:add-20-regular" /></template>
			</TButton>
		</div>
		<div class="body" id="linkSiderBody">
			<TCollapse borderless>
				<TCollapsePanel v-for="item in 50" :header="String(item)" class="link">
					<template #headerRightContent>
						<TDropdown>
							<div class="link_action" @click.stop>
								<Icon height="16" width="16" icon="fluent:more-vertical-20-regular" />
							</div>
							<TDropdownMenu>
								<TDropdownItem :divider="true">
									<template #prefixIcon><Icon height="16" width="16" icon="fluent:padding-top-20-regular" /></template>
									<span>置顶</span>
								</TDropdownItem>
								<TDropdownItem theme="warning">
									<template #prefixIcon><Icon height="16" width="16" icon="fluent:power-20-regular" /></template>
									<span>关闭</span>
								</TDropdownItem>
								<TDropdownItem>
									<template #prefixIcon><Icon height="16" width="16" icon="fluent:settings-20-regular" /></template>
									<span>编辑</span>
								</TDropdownItem>
								<TDropdownItem theme="error">
									<template #prefixIcon><Icon height="16" width="16" icon="fluent:delete-20-regular" /></template>
									<span>删除</span>
								</TDropdownItem>
							</TDropdownMenu>
						</TDropdown>
					</template>
					<div class="link_content">123</div>
				</TCollapsePanel>
			</TCollapse>
			<TBackTop container="#linkSiderBody" />
		</div>
		<Edit ref="editRef" />
	</div>
</template>

<script setup lang="ts">
import { OverlayScrollbars } from 'overlayscrollbars'
import Edit from './Edit.vue'

// scroll bar
onMounted(() => {
	OverlayScrollbars(document.getElementById('linkSiderBody'), {
		overflow: { x: 'hidden', y: 'scroll' },
		scrollbars: { autoHide: 'leave' },
	})
})

// handle add or edit link event
const editRef = ref<InstanceType<typeof Edit>>()
function handleEditLinkClick() {
	editRef.value.open()
}
</script>

<style scoped lang="scss">
.sider {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.header {
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

.body {
	flex: 1;

	:deep(.t-collapse-panel__header) {
		transition: background-color var(--td-transition);

		&:hover {
			background-color: var(--td-bg-color-container-hover);

			.link_action {
				opacity: 1;
			}
		}
	}

	:deep(.t-collapse-panel__body) {
		background-color: var(--td-bg-color-secondarycontainer);
		border-top: 1px solid var(--td-component-stroke);
		border-bottom: 1px solid var(--td-component-stroke);
	}
}

.link {
	&_action {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--td-radius-default);
		padding: var(--td-comp-paddingLR-xxs);
		transition: all var(--td-transition);
		opacity: 0;
		--ripple-color: var(--td-bg-color-container-active);
	}
}
</style>
