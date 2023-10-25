<template>
	<Dialog
		title="修改确认"
		width="800px"
		v-model:visible="visible"
		icon="fluent:split-hint-20-regular"
		:close-on-overlay-click="false"
		placement="center"
		@opened="handleDialogOpened()"
	>
		<TLoading :loading="loading" :delay="200">
			<div class="diff-confirm">
				<div class="header">
					<span>修改前</span>
					<span>修改后</span>
				</div>
				<DiffEditor :immediate="false" ref="diffEditorRef" />
			</div>
		</TLoading>
	</Dialog>
</template>

<script setup lang="ts">
import DiffEditor from '@/components/DiffEditor.vue'

defineOptions({ name: 'ConnectionKeyEditDiffConfirmDialog' })

// open dialog
const visible = ref(false)
function open(_originalModel: string, _modifiedModel: string, _language?: string) {
	originalModel = _originalModel
	modifiedModel = _modifiedModel
	language = _language
	visible.value = true
	loading.value = true
}

// init editor
const loading = ref(false)
const diffEditorRef = ref<InstanceType<typeof DiffEditor>>()
let originalModel: string
let modifiedModel: string
let language: string
function handleDialogOpened() {
	diffEditorRef.value.init(originalModel, modifiedModel, language)
	loading.value = false
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.diff-confirm {
	height: 50vh;
	margin: 0 var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m);
	border-radius: var(--td-radius-medium);
	border: 1px solid var(--td-component-stroke);
	overflow: hidden;
}

.header {
	display: flex;
	justify-content: space-between;
	font: var(--td-font-body-small);
	color: var(--td-text-color-secondary);
	padding: 0 var(--td-comp-paddingLR-s);
	border-bottom: 1px solid var(--td-component-stroke);
}
</style>
