<template>
	<div class="list">
		<div class="header">
			<div class="header_row">
				<TSelect size="small" v-model="selctedDatabase" :options="databases" :loading="isDatabaseLoading">
					<template #prefixIcon>
						<Icon height="16" width="16" icon="fluent:database-16-regular" />
					</template>
					<template #panelTopContent>
						<div class="database-top">
							<TButton size="small" variant="text" block @click="initDatabase()">
								<template #icon>
									<Icon height="16" width="16" icon="fluent:arrow-counterclockwise-16-regular" />
								</template>
								<span>刷新</span>
							</TButton>
						</div>
					</template>
				</TSelect>
				<TTooltip content="刷新" theme="light" :show-arrow="false">
					<TButton size="small" variant="outline" @click="init()">
						<template #icon><Icon height="16" width="16" icon="fluent:arrow-counterclockwise-16-regular" /></template>
					</TButton>
				</TTooltip>
				<TTooltip content="新增键" theme="light" :show-arrow="false">
					<TButton size="small" variant="outline">
						<template #icon><Icon height="16" width="16" icon="fluent:add-16-regular" /></template>
					</TButton>
				</TTooltip>
			</div>
			<div class="header_row">
				<TInput size="small" placeholder="搜索" clearable>
					<template #prefixIcon><Icon height="16" width="16" icon="fluent:search-16-regular" /></template>
				</TInput>
			</div>
		</div>
		<TSkeleton class="body" :loading="isKeysLoading" :row-col="skeletonRowCol">
			<template v-for="item in keys" :key="item">
				<ContextMenu :options="contextMenuOptions">
					<div class="body_item" v-ripple>
						<Icon height="16" width="16" icon="fluent:key-16-regular" />
						<TextEllipsis class="body_item_label" :content="item" />
					</div>
				</ContextMenu>
			</template>
		</TSkeleton>
	</div>
</template>

<script setup lang="ts">
import { type SkeletonRowCol } from 'tdesign-vue-next'
import { useDatabaseSelect, useGetAllKeys } from '../hooks'
import { type Connection } from '@/store/modules/connections'
import { type ContextMenuOption } from '@/components/ContextMenu.vue'

const props = defineProps<{ connection: Connection }>()

// skeleton
const skeletonRowCol: SkeletonRowCol = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

// init database
const selctedDatabase = ref<number>(0)
const { isLoading: isDatabaseLoading, init: initDatabase, options: databases } = useDatabaseSelect(props.connection.id)

// init keys
const { isLoading: isKeysLoading, init: getAllKeys, keys } = useGetAllKeys(props.connection.id)
function initKeys() {
	window.mainWindow.redis.select(props.connection.id, selctedDatabase.value)
	getAllKeys()
}

// init
async function init() {
	await initDatabase()
	initKeys()
}

// context menu
const contextMenuOptions: ContextMenuOption[] = [
	{ label: '删除键', value: 'remove', icon: 'fluent:delete-16-regular', theme: 'error' },
]

defineExpose({ init })
</script>

<style scoped lang="scss">
.list {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: 0 var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m);
	overflow: hidden;
}

.header {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);

	&_row {
		display: flex;
		gap: var(--td-comp-margin-xs);
	}

	:global(.database-top) {
		position: sticky;
		top: 0;
		padding: var(--td-comp-paddingTB-xs);
		border-bottom: 1px solid var(--td-component-stroke);
		background-color: var(--td-bg-color-container);
		z-index: 3;
	}
}

.body {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-xs);

	&_item {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		font: var(--td-font-body-medium);
		color: var(--td-text-color-primary);
		padding: 0 var(--td-comp-paddingLR-xs);
		border-radius: var(--td-radius-default);
		cursor: pointer;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&_label {
			flex: 1;
		}
	}

	:deep(.t-skeleton__row) {
		margin-bottom: var(--td-comp-margin-s);
	}
}
</style>
