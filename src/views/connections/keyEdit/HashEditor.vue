<template>
	<div class="hash-editor" ref="containerRef">
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
			:height="tableHeight"
			stripe
			attach="#app"
			size="small"
		>
			<template #fieldName="{ row, col }">
				<div class="table-cell">
					<TTooltip
						placement="left"
						:show-arrow="false"
						:content="row[col.colKey]"
						v-if="!fieldNameEditStatusMap.get(row[col.colKey])"
					>
						<div class="table-cell_text">{{ row[col.colKey] }}</div>
					</TTooltip>
					<div class="table-cell_input" v-show="fieldNameEditStatusMap.get(row[col.colKey])">
						<TInput
							size="small"
							v-model="fieldNameEditValueMap[row[col.colKey]]"
							:status="fieldNameInputStatusMap.get(row[col.colKey])"
						/>
						<TButton
							size="small"
							variant="text"
							theme="success"
							shape="square"
							:loading="isFieldNameRenameLoading"
							@click="handleFieldNameRenameClick(row[col.colKey], row.fieldValue)"
						>
							<template #icon>
								<Icon height="14" width="14" icon="fluent:checkmark-16-regular" />
							</template>
						</TButton>
						<TButton
							size="small"
							variant="text"
							theme="danger"
							shape="square"
							@click="exitFieldNameEdit(row[col.colKey])"
						>
							<Icon height="14" width="14" icon="fluent:dismiss-16-regular" />
						</TButton>
					</div>
					<div class="table-cell_actions" v-show="!fieldNameEditStatusMap.get(row[col.colKey])">
						<TTooltip :show-arrow="false" content="编辑">
							<TButton
								size="small"
								theme="primary"
								variant="text"
								shape="square"
								@click="enterFieldNameEdit(row[col.colKey])"
							>
								<Icon height="16" width="16" icon="fluent:document-edit-16-regular" />
							</TButton>
						</TTooltip>
						<FieldNameCopyButton @click="handleFieldNameCopyClick(row[col.colKey])" />
					</div>
				</div>
			</template>
			<template #fieldValue="{ row, col }">
				<div class="table-cell">
					<TTooltip placement="left" :show-arrow="false" :content="row[col.colKey]">
						<div class="table-cell_text">{{ row[col.colKey] }}</div>
					</TTooltip>
					<div class="table-cell_actions">
						<TTooltip :show-arrow="false" content="编辑">
							<TButton
								size="small"
								theme="primary"
								variant="text"
								shape="square"
								@click="handleFieldValueEditClick(row.fieldName, row[col.colKey])"
							>
								<Icon height="16" width="16" icon="fluent:document-edit-16-regular" />
							</TButton>
						</TTooltip>
						<FieldValueCopyButton @click="handleFieldValueCopyClick(row[col.colKey])" />
					</div>
				</div>
			</template>
		</TPrimaryTable>
		<EditorDialog ref="editorDialogRef" />
	</div>
</template>

<script setup lang="tsx">
import { useElementSize, useEventBus } from '@vueuse/core'
import { type PrimaryTableCol, MessagePlugin } from 'tdesign-vue-next'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { useCopyButton } from '@/hooks'
import EditorDialog from './EditorDialog.vue'
import { keyEditInjectKey, keyEditUpdatedEventKey } from '../keys'
import { useHashFieldNameRename } from '../hooks'

self.MonacoEnvironment = {
	getWorker: function (workerId, label) {
		switch (label) {
			case 'json':
				return new jsonWorker()
			default:
				return new editorWorker()
		}
	},
}

defineOptions({ name: 'ConnectionsKeyEditHashEditor' })

const injectData = inject(keyEditInjectKey)

const formatedMemoryUsage = computed(() => {
	const kb = injectData.value.memoryUsage / 1024
	return kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`
})

// table height
const containerRef = ref()
const { height: tableHeight } = useElementSize(containerRef)

// formate data
const data = computed(() => {
	if (!injectData.value.value) return []
	return injectData.value.value.map(item => ({
		fieldName: item.field,
		fieldValue: item.value,
	}))
})

const columns: PrimaryTableCol[] = [
	{ colKey: 'serial-number', width: 50 },
	{ title: '属性名', colKey: 'fieldName', cell: 'fieldName' },
	{ title: '属性值', colKey: 'fieldValue', cell: 'fieldValue' },
]

// copy field name
const {
	CopyButton: FieldNameCopyButton,
	copy: copyFieldName,
	enterLoading: enterFieldNameCopyLoading,
	exitLoading: exitFieldNameCopyLoading,
} = useCopyButton({ autoCopy: false, buttonProps: { size: 'small' } })
async function handleFieldNameCopyClick(value: string) {
	try {
		enterFieldNameCopyLoading()
		await copyFieldName(value)
	} finally {
		exitFieldNameCopyLoading()
	}
}

// copy field value
const {
	CopyButton: FieldValueCopyButton,
	copy: copyFieldValue,
	enterLoading: enterFieldValueCopyLoading,
	exitLoading: exitFieldValueCopyLoading,
} = useCopyButton({ autoCopy: false, buttonProps: { size: 'small' } })
async function handleFieldValueCopyClick(value: string) {
	try {
		enterFieldValueCopyLoading()
		await copyFieldValue(value)
	} finally {
		exitFieldValueCopyLoading()
	}
}

// field name edit status
const fieldNameEditStatusMap = ref(new Map<string, boolean>())
const fieldNameEditValueMap = ref<Record<string, string>>({})
type InputStatus = 'error' | 'default' | 'success' | 'warning'
const fieldNameInputStatusMap = ref(new Map<string, InputStatus>())
function enterFieldNameEdit(fieldName: string) {
	fieldNameEditStatusMap.value.set(fieldName, true)
	fieldNameEditStatusMap.value.forEach((value, key) => fieldNameEditStatusMap.value.set(key, key === fieldName))
	fieldNameInputStatusMap.value.forEach((value, key) => fieldNameInputStatusMap.value.set(key, 'default'))
	fieldNameEditValueMap.value[fieldName] = fieldName
}
function exitFieldNameEdit(fieldName: string) {
	fieldNameEditStatusMap.value.set(fieldName, false)
}

// field name rename click
const { isLoading: isFieldNameRenameLoading, execute: renameFieldName } = useHashFieldNameRename(injectData.value.id)
async function handleFieldNameRenameClick(fieldName: string, fieldValue: string) {
	const modifiedValue = fieldNameEditValueMap.value[fieldName]
	if (!modifiedValue) {
		fieldNameInputStatusMap.value.set(fieldName, 'error')
		MessagePlugin.error('属性名不能为空')
		return
	}
	await renameFieldName(injectData.value.key, fieldName, modifiedValue, fieldValue)
	MessagePlugin.success('保存成功')
	useEventBus(keyEditUpdatedEventKey).emit()
	fieldNameEditStatusMap.value.clear()
}

// field value edit click
const editorDialogRef = ref<InstanceType<typeof EditorDialog>>()
function handleFieldValueEditClick(fieldName: string, fieldValue: string) {
	editorDialogRef.value.open({
		value: fieldValue,
		confirm: async value => {
			const { id, key } = injectData.value
			await window.mainWindow.redis.hset(id, key, fieldName, value)
			MessagePlugin.success('保存成功')
			useEventBus(keyEditUpdatedEventKey).emit()
		},
	})
}
</script>

<style scoped lang="scss">
.hash-editor {
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
