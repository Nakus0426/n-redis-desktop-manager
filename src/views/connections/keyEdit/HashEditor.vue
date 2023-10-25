<template>
	<div class="hash-editor" ref="containerRef">
		<TPrimaryTable
			row-key="fieldName"
			:columns="columns"
			:data="data"
			:scroll="{ type: 'virtual' }"
			:height="tableHeight"
			hover
			stripe
			attach="#app"
			size="small"
		>
			<template #fieldName="{ row, col }">
				<div class="table-cell">
					<Tooltip
						placement="left"
						:show-arrow="false"
						:content="row[col.colKey]"
						v-if="!fieldNameEditStatusMap.get(row[col.colKey])"
					>
						<div class="table-cell_text">{{ row[col.colKey] }}</div>
					</Tooltip>
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
							@click="handleFieldNameRenameClick(row[col.colKey])"
						>
							<Icon height="14" width="14" icon="fluent:checkmark-16-regular" />
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
						<Tooltip :show-arrow="false" content="编辑">
							<TButton
								size="small"
								theme="primary"
								variant="text"
								shape="square"
								@click="enterFieldNameEdit(row[col.colKey])"
							>
								<Icon height="16" width="16" icon="fluent:edit-16-regular" />
							</TButton>
						</Tooltip>
						<FieldNameCopyButton @click="handleFeildNameCopyClick(row[col.colKey])" />
					</div>
				</div>
			</template>
			<template #fieldValue="{ row, col }">
				<div class="table-cell">
					<Tooltip placement="left" :show-arrow="false" :content="row[col.colKey]">
						<div class="table-cell_text">{{ row[col.colKey] }}</div>
					</Tooltip>
					<div class="table-cell_actions">
						<Tooltip :show-arrow="false" content="编辑">
							<TButton size="small" theme="primary" variant="text" shape="square">
								<Icon height="16" width="16" icon="fluent:edit-16-regular" />
							</TButton>
						</Tooltip>
						<FieldValueCopyButton @click="handleFeildValueCopyClick(row[col.colKey])" />
					</div>
				</div>
			</template>
		</TPrimaryTable>
		<DiffConfirmDialog ref="diffConfirmDialogRef" />
	</div>
</template>

<script setup lang="tsx">
import { useElementSize } from '@vueuse/core'
import { type PrimaryTableCol, Tooltip, MessagePlugin } from 'tdesign-vue-next'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { useCopyButton } from '@/hooks'
import DiffConfirmDialog from './DiffConfirmDialog.vue'

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

const props = defineProps<{ data: any }>()

// table height
const containerRef = ref()
const { height: tableHeight } = useElementSize(containerRef)

// formate data
const data = computed(() => {
	if (!props.data) return []
	return Object.keys(props.data).map(item => ({ fieldName: item, fieldValue: props.data[item] }))
})

const columns: PrimaryTableCol[] = [
	{ colKey: 'serial-number', width: 50 },
	{ title: '属性名', colKey: 'fieldName', cell: 'fieldName' },
	{ title: '属性值', colKey: 'fieldValue', cell: 'fieldValue' },
]

// copy field name
const {
	CopyButton: FieldNameCopyButton,
	copy: copyFeildName,
	enterLoading: enterFeildNameCopyLoading,
	exitLoading: exitFeildNameCopyLoading,
} = useCopyButton({ autoCopy: false, buttonProps: { size: 'small' } })
async function handleFeildNameCopyClick(value: string) {
	try {
		enterFeildNameCopyLoading()
		await copyFeildName(value)
	} finally {
		exitFeildNameCopyLoading()
	}
}

// copy field value
const {
	CopyButton: FieldValueCopyButton,
	copy: copyFeildValue,
	enterLoading: enterFeildValueCopyLoading,
	exitLoading: exitFeildValueCopyLoading,
} = useCopyButton({ autoCopy: false, buttonProps: { size: 'small' } })
async function handleFeildValueCopyClick(value: string) {
	try {
		enterFeildValueCopyLoading()
		await copyFeildValue(value)
	} finally {
		exitFeildValueCopyLoading()
	}
}

// field name edit status
const fieldNameEditStatusMap = ref(new Map<string, boolean>())
const fieldNameEditValueMap = ref<Record<string, string>>({})
type InputStatus = 'error' | 'default' | 'success' | 'warning'
const fieldNameInputStatusMap = ref(new Map<string, InputStatus>())
function enterFieldNameEdit(key: string) {
	fieldNameEditStatusMap.value.set(key, true)
	fieldNameInputStatusMap.value.set(key, 'default')
	fieldNameEditValueMap.value[key] = key
}
function exitFieldNameEdit(key: string) {
	fieldNameEditStatusMap.value.set(key, false)
}

// field name rename
const diffConfirmDialogRef = ref<InstanceType<typeof DiffConfirmDialog>>()
function handleFieldNameRenameClick(key: string) {
	const value = fieldNameEditValueMap.value[key]
	if (!value) {
		fieldNameInputStatusMap.value.set(key, 'error')
		MessagePlugin.error('属性名不能为空')
		return
	}
	diffConfirmDialogRef.value.open(key, value)
}
</script>

<style scoped lang="scss">
.hash-editor {
	border-radius: var(--td-radius-medium);
	border: 1px solid var(--td-component-stroke);
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
