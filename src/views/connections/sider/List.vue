<template>
	<div class="list">
		<div class="header">
			<div class="header_row">
				<TSelect
					size="small"
					v-model="selctedDatabase"
					:options="databases"
					:loading="isDatabaseLoading"
					@change="init()"
				>
					<template #prefixIcon>
						<Icon height="16" width="16" icon="fluent:database-16-regular" />
					</template>
					<template #panelTopContent>
						<div class="database-top">
							<TButton size="small" variant="text" block :disabled="isDatabaseLoading" @click="initDatabase()">
								<template #icon>
									<Icon height="16" width="16" icon="fluent:arrow-counterclockwise-16-regular" />
								</template>
								<span>刷新</span>
							</TButton>
						</div>
					</template>
				</TSelect>
				<TTooltip content="刷新" theme="light" :show-arrow="false">
					<TButton size="small" variant="outline" :disabled="isKeysLoading" @click="init()">
						<template #icon><Icon height="16" width="16" icon="fluent:arrow-counterclockwise-16-regular" /></template>
					</TButton>
				</TTooltip>
				<TTooltip content="新增键" theme="light" :show-arrow="false">
					<TButton size="small" variant="outline" @click="handleKeyAddClick()">
						<template #icon><Icon height="16" width="16" icon="fluent:add-16-regular" /></template>
					</TButton>
				</TTooltip>
			</div>
			<div class="header_row">
				<TInput size="small" placeholder="搜索" clearable @change="initVirtualKeys">
					<template #prefixIcon><Icon height="16" width="16" icon="fluent:search-16-regular" /></template>
				</TInput>
			</div>
		</div>
		<div class="body">
			<template v-for="(item, index) in vitrualKeys" :key="item">
				<ContextMenu :options="contextMenuOptions" @select="value => handleContextMenuClick(value, item.value)">
					<div
						class="body_item"
						:class="{ 'is-actived': activedTab?.key === item.value }"
						v-ripple
						ref="keyRefs"
						:data-index="index"
						@click="handleKeyClick(item.value)"
					>
						<template v-if="item.visible">
							<Icon height="16" width="16" icon="fluent:key-16-regular" />
							<TextEllipsis class="body_item_label" :content="item.value" />
						</template>
					</div>
				</ContextMenu>
			</template>
			<TLoading size="small" :loading="isKeysLoading" />
			<div class="empty" v-if="!isKeysLoading && vitrualKeys.length === 0">暂无数据</div>
		</div>
	</div>
	<KeyAddDialog ref="keyAddDialogRef" />
</template>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { useDatabaseSelect, useGetAllKeys, useRemoveKey, useTabs } from '../hooks'
import { type Connection } from '@/store/modules/connections'
import { type ContextMenuOption } from '@/components/ContextMenu.vue'
import KeyAddDialog from './KeyAddDialog.vue'
import { useLoading } from '@/hooks/useLoading'

const props = defineProps<{ connection: Connection }>()

const { activedTab, addTab } = useTabs()

// init database
const selctedDatabase = ref<number>(0)
const { isLoading: isDatabaseLoading, init: initDatabase, options: databases } = useDatabaseSelect(props.connection.id)

// init keys
const { isLoading: isKeysLoading, enter: enterKeysLoading, exit: exitKeysLoading } = useLoading()
const { init: getAllKeys, keys } = useGetAllKeys(props.connection.id)
async function initKeys() {
	try {
		enterKeysLoading()
		window.mainWindow.redis.select(props.connection.id, selctedDatabase.value)
		await getAllKeys()
		await initVirtualKeys()
	} finally {
		exitKeysLoading()
	}
}

// key virtual list
const keyRefs = ref<HTMLElement[]>([])
const vitrualKeys = ref<Array<{ value: string; visible: boolean }>>([])
const observer = new IntersectionObserver(
	entries => {
		entries.forEach(entry => {
			const index = Number(entry.target['dataset'].index)
			vitrualKeys.value[index].visible = entry.isIntersecting
		})
	},
	{ rootMargin: '200px 0px' },
)
async function initVirtualKeys(keyword?: string) {
	const filteredKeys = ['', null, undefined].includes(keyword?.trim())
		? keys.value
		: keys.value.filter(key => key.includes(keyword))
	vitrualKeys.value = filteredKeys.map(key => ({ value: key, visible: false }))
	observer.disconnect()
	await nextTick()
	keyRefs.value.forEach(item => observer.observe(item))
}

// init
async function init() {
	await initDatabase()
	await initKeys()
}

// context menu
const contextMenuOptions: ContextMenuOption[] = [
	{ label: '删除键', value: 'remove', icon: 'fluent:delete-16-regular', theme: 'error' },
]

// context menu click
function handleContextMenuClick(value: ContextMenuOption['value'], key: string) {
	if (value === 'remove') {
		const { isLoading: isRemoveLoading, remove } = useRemoveKey(props.connection.id, key)
		const dialogInstance = DialogPlugin.confirm({
			header: '删除确认',
			body: '确定要删除该键吗？',
			theme: 'danger',
			placement: 'center',
			confirmBtn: { loading: isRemoveLoading.value, theme: 'danger' },
			onConfirm: async () => {
				MessagePlugin.success('删除成功')
				await remove()
				dialogInstance.destroy()
				init()
			},
		})
	}
}

// key click
function handleKeyClick(key: string) {
	addTab({ id: props.connection.id, key, title: key })
}

// key add click
const keyAddDialogRef = ref<InstanceType<typeof KeyAddDialog>>()
function handleKeyAddClick() {
	keyAddDialogRef.value.open()
}

defineExpose({ init })
</script>

<style scoped lang="scss">
.list {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-m);
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
		height: var(--td-line-height-body-medium);
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		font: var(--td-font-body-medium);
		color: var(--td-text-color-primary);
		padding: 0 var(--td-comp-paddingLR-xs);
		border-radius: var(--td-radius-default);
		cursor: pointer;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover:not(.is-actived) {
			background-color: var(--td-bg-color-container-hover);
		}

		&.is-actived {
			color: var(--td-brand-color);
			background-color: var(--td-brand-color-light);
		}

		&_label {
			flex: 1;
		}
	}

	.empty {
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		font: var(--td-font-body-medium);
		color: var(--td-text-color-secondary);
	}

	:deep(.t-skeleton__row) {
		margin-bottom: var(--td-comp-margin-s);
	}
}
</style>
