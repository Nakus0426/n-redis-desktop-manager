<template>
	<div class="set-editor">
		<div class="header">
			<div class="header_prefix">
				<TTooltip content="大小" :show-arrow="false" placement="right">
					<TTag>{{ formatedMemoryUsage }}</TTag>
				</TTooltip>
			</div>
			<div class="header_suffix"></div>
		</div>
		<TPrimaryTable
			class="body"
			row-key="fieldName"
			:columns="columns"
			:data="data"
			:scroll="{ type: 'virtual' }"
			stripe
			attach="#app"
			size="small"
		>
			<template #value="{ row, col, rowIndex }">
				<div class="table-cell">
					<TTooltip placement="left" :show-arrow="false" :content="row[col.colKey]" v-if="!editStatusMap.get(rowIndex)">
						<div class="table-cell_text">{{ row[col.colKey] }}</div>
					</TTooltip>
					<div class="table-cell_input" v-show="editStatusMap.get(rowIndex)">
						<TInput size="small" v-model="editValueMap[rowIndex]" :status="inputStatusMap.get(rowIndex)" />
						<TButton
							size="small"
							variant="text"
							theme="success"
							shape="square"
							:loading="isUpdateLoading"
							@click="handleUpdateClick(rowIndex)"
						>
							<template #icon>
								<Icon height="14" width="14" icon="fluent:checkmark-16-regular" />
							</template>
						</TButton>
						<TButton size="small" variant="text" theme="danger" shape="square" @click="exitEdit(rowIndex)">
							<Icon height="14" width="14" icon="fluent:dismiss-16-regular" />
						</TButton>
					</div>
					<div class="table-cell_actions" v-show="!editStatusMap.get(rowIndex)">
						<TTooltip :show-arrow="false" content="编辑">
							<TButton size="small" theme="primary" variant="text" shape="square" @click="enterEdit(rowIndex)">
								<Icon height="16" width="16" icon="fluent:document-edit-16-regular" />
							</TButton>
						</TTooltip>
						<RowCopyButton @click="handleRowCopyClick(row[col.colKey])" />
					</div>
				</div>
			</template>
		</TPrimaryTable>
	</div>
</template>

<script setup lang="ts">
import { MessagePlugin, type PrimaryTableCol } from 'tdesign-vue-next'
import { keyEditInjectKey, keyEditUpdatedEventKey } from '../keys'
import { useSetUpdate } from '../hooks'
import { useCopyButton } from '@/hooks'
import { useEventBus } from '@vueuse/core'

const injectData = inject(keyEditInjectKey)

const formatedMemoryUsage = computed(() => {
	const kb = injectData.value.memoryUsage / 1024
	return kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`
})

// formate data
const data = computed(() => {
	if (!injectData.value.value) return []
	return injectData.value.value.map(value => ({ value }))
})

const columns: PrimaryTableCol[] = [
	{ colKey: 'serial-number', width: 50 },
	{ title: '值', colKey: 'value', cell: 'value' },
]

// edit status
const editStatusMap = ref(new Map<number, boolean>())
const editValueMap = ref<Record<number, string>>({})
type InputStatus = 'error' | 'default' | 'success' | 'warning'
const inputStatusMap = ref(new Map<number, InputStatus>())
function enterEdit(index: number) {
	editStatusMap.value.clear()
	editStatusMap.value.set(index, true)
	inputStatusMap.value.clear()
	editValueMap.value[index] = data.value[index].value
}
function exitEdit(index: number) {
	editStatusMap.value.set(index, false)
}

// update click
const { isLoading: isUpdateLoading, execute: updateSet } = useSetUpdate(injectData.value.id)
async function handleUpdateClick(index: number) {
	const modifiedValue = editValueMap.value?.[index]
	if (!modifiedValue) {
		inputStatusMap.value.set(index, 'error')
		MessagePlugin.error('值不能为空')
		return
	}
	console.log(data.value[index], modifiedValue)
	await updateSet(injectData.value.key, data.value[index].value, modifiedValue)
	editStatusMap.value.clear()
	inputStatusMap.value.clear()
	MessagePlugin.success('保存成功')
	useEventBus(keyEditUpdatedEventKey).emit()
}

// copy row
// copy field name
const {
	CopyButton: RowCopyButton,
	copy: copyRow,
	enterLoading: enterRowCopyLoading,
	exitLoading: exitRowCopyLoading,
} = useCopyButton({ autoCopy: false, buttonProps: { size: 'small' } })
async function handleRowCopyClick(value: string) {
	try {
		enterRowCopyLoading()
		await copyRow(value)
	} finally {
		exitRowCopyLoading()
	}
}
</script>

<style scoped lang="scss">
.set-editor {
	display: flex;
	flex-direction: column;
}

.header {
	padding: var(--td-comp-paddingLR-s) 0;
	border-bottom: 1px solid var(--td-component-stroke);
}

.body {
	flex: 1;
}

.table-cell {
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	gap: var(--td-comp-margin-xs);
	overflow: hidden;

	&:hover .table-cell_actions {
		width: calc(48px + var(--td-comp-margin-xs));
	}

	&_text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 24px;
	}

	&_input {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-xs);
	}

	&_actions {
		display: flex;
		gap: var(--td-comp-margin-xs);
		width: 0;
		transition: all var(--td-transition);
	}
}
</style>
