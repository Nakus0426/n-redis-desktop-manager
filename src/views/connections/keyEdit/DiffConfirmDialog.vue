<template>
	<Dialog
		title="修改确认"
		width="800px"
		v-model:visible="visible"
		icon="fluent:split-hint-20-regular"
		:close-on-overlay-click="false"
		placement="center"
		@opened="handleDialogOpened()"
		@close="handleClose()"
		@confirm="handleConfirm()"
	>
		<TLoading :loading="loading" :delay="300">
			<div class="diff-confirm">
				<div class="header">
					<div class="header_item">
						<span class="header_item_label">新增：</span>
						<span class="header_item_value add">{{ lineChanges?.add ?? '-' }}</span>
					</div>
					<div class="header_item">
						<span class="header_item_label">删除：</span>
						<span class="header_item_value delete">{{ lineChanges?.delete ?? '-' }}</span>
					</div>
				</div>
				<div class="body">
					<div class="body_header">
						<span>修改前</span>
						<span>修改后</span>
					</div>
					<DiffEditor :immediate="false" ref="diffEditorRef" @update="handleDiffEditorUpadte()" />
				</div>
			</div>
		</TLoading>
	</Dialog>
</template>

<script setup lang="ts">
import DiffEditor from '@/components/DiffEditor.vue'

defineOptions({ name: 'ConnectionKeyEditDiffConfirmDialog' })

const emit = defineEmits<{ close: []; confirm: [type: typeof type, key: string, value: string] }>()

// open dialog
const visible = ref(false)
function open(_type: typeof type, _key: string, _originalModel: string, _modifiedModel: string, _language?: string) {
	key = _key
	originalModel = _originalModel
	modifiedModel = _modifiedModel
	language = _language
	visible.value = true
	loading.value = true
}

// init editor
const loading = ref(false)
const diffEditorRef = ref<InstanceType<typeof DiffEditor>>()
let type: 'fieldName' | 'fieldValue' | 'key'
let key: string
let originalModel: string
let modifiedModel: string
let language: string
function handleDialogOpened() {
	diffEditorRef.value.init(originalModel, modifiedModel, language)
	loading.value = false
}

// init line changes
const lineChanges = ref<{ add: number; delete: number }>()
function handleDiffEditorUpadte() {
	const _lineChanges = diffEditorRef.value.getLineChanges()
	lineChanges.value = { add: _lineChanges.addedLineCount, delete: _lineChanges.deletedLineCount }
}

// dialog close
function handleClose() {
	emit('close')
}

// dialog confirm
function handleConfirm() {
	emit('confirm', type, key, modifiedModel)
	visible.value = false
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.diff-confirm {
	height: 50vh;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	margin: 0 var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m);
}

.header {
	display: flex;
	gap: var(--td-comp-margin-l);
	font: var(--td-font-body-medium);
	color: var(--td-text-color-primary);

	&_item_value {
		font: var(--td-font-mark-medium);

		&.add {
			color: var(--td-success-color);
		}

		&.delete {
			color: var(--td-error-color);
		}
	}
}

.body {
	flex: 1;
	border-radius: var(--td-radius-medium);
	border: 1px solid var(--td-component-stroke);
	overflow: hidden;

	&_header {
		display: flex;
		justify-content: space-between;
		font: var(--td-font-body-small);
		color: var(--td-text-color-secondary);
		padding: 0 var(--td-comp-paddingLR-s);
		border-bottom: 1px solid var(--td-component-stroke);
	}
}
</style>
