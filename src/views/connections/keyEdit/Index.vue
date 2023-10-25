<template>
	<div class="key-edit">
		<div class="header">
			<div class="header_title">
				<div class="header_title_key">
					<TTooltip :show-arrow="false" content="类型">
						<TTag variant="light" theme="primary">{{ upperFirst(keyType) }}</TTag>
					</TTooltip>
					<TextEllipsis :content="data" @click="enterKeyEdit()" v-show="!keyEditing" />
					<div class="header_title_input" v-show="keyEditing">
						<TInput size="small" ref="keyEditInputRef" v-model="keyEditValue" @enter="handleRenameClick()" />
						<TButton
							size="small"
							variant="text"
							theme="success"
							shape="square"
							:loading="isRenameLoading"
							@click="handleRenameClick()"
						>
							<Icon height="14" width="14" icon="fluent:checkmark-16-regular" />
						</TButton>
						<TButton size="small" variant="text" theme="danger" shape="square" @click="exitKeyEdit()">
							<Icon height="14" width="14" icon="fluent:dismiss-16-regular" />
						</TButton>
					</div>
				</div>
				<div class="header_divider" />
				<div class="header_title_ttl">
					<TTooltip :show-arrow="false" content="过期时间">
						<TTag variant="light" theme="default">TTL</TTag>
					</TTooltip>
					<TextEllipsis :content="keyTtl" v-show="!ttlEditing" @click="enterTtlEdit()" />
					<div class="header_title_input" v-show="ttlEditing">
						<TInputNumber
							size="small"
							theme="normal"
							ref="ttlEditInputRef"
							v-model="ttlEditValue"
							@enter="handleTtlEditClick()"
						/>
						<TButton
							size="small"
							variant="text"
							theme="success"
							shape="square"
							:loading="isTtlLoading"
							@click="handleTtlEditClick()"
						>
							<Icon height="14" width="14" icon="fluent:checkmark-16-regular" />
						</TButton>
						<TButton size="small" variant="text" theme="danger" shape="square" @click="exitTtlEdit()">
							<Icon height="14" width="14" icon="fluent:dismiss-16-regular" />
						</TButton>
					</div>
				</div>
			</div>
			<div class="header_divider" />
			<div class="header_action">
				<TTooltip content="删除" placement="top" :show-arrow="false">
					<TButton size="small" theme="danger" shape="square" variant="text" @click="handleRemoveClick()">
						<Icon height="20" width="20" icon="fluent:delete-20-regular" />
					</TButton>
				</TTooltip>
			</div>
		</div>
		<div class="body">
			<div class="body_actions">
				<div class="body_actions_prefix">
					<TSelect size="small" borderless auto-width v-model="language" v-if="editorVisible">
						<TOption label="Text" value="" />
						<TOption label="JSON" value="json" />
					</TSelect>
					<TTooltip :show-arrow="false" content="内存占用">
						<TTag theme="primary" variant="light">{{ formatedMemoryUsage }}</TTag>
					</TTooltip>
				</div>
				<div class="body_actions_suffix"><CopyButton /></div>
			</div>
			<component class="body_content" :is="bodyComponent" :data="keyValue" />
		</div>
		<AutoRefresh @refresh="handleAutoRefreshClick()" />
	</div>
</template>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { useEventBus } from '@vueuse/core'
import { upperFirst } from 'lodash-es'
import { type KeyType } from '@/utils'
import { useCopyButton, useLoading } from '@/hooks'
import { keyActivedEventKey, keyEditInjectKey, keyRemovedEventKey, keyRenamedEventKey } from '../keys'
import AutoRefresh from '../components/AutoRefresh.vue'
import StringEditor from './StringEditor.vue'
import HashEditor from './HashEditor.vue'

defineOptions({ name: 'ConnectionsKeyEditIndex' })

const props = defineProps<{ data: string; id: string }>()

// provide data
const injectData = computed(() => ({
	id: props.id,
	key: props.data,
	type: keyType.value,
	memoryUsage: memoryUsage.value,
}))
provide(keyEditInjectKey, injectData)

// init data
onMounted(async () => {
	await initKeyType()
	initKeyValue()
	initKeyTtl()
	initMemoryUsage()
})

// init key type
const keyType = ref<KeyType>()
async function initKeyType() {
	const type = await window.mainWindow.redis.type(props.id, props.data)
	keyType.value = type || '-'
}

// init key value
const keyValue = ref()
async function initKeyValue() {
	const value = await window.mainWindow.redis.get(props.id, props.data, keyType.value)
	keyValue.value = value || ''
}

// init key ttl
const keyTtl = ref<number>()
async function initKeyTtl() {
	const ttl = await window.mainWindow.redis.ttl(props.id, props.data)
	keyTtl.value = ttl
}

// init memeory usage
const memoryUsage = ref<number>()
const formatedMemoryUsage = computed(() => {
	const kb = memoryUsage.value / 1024
	return kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`
})
async function initMemoryUsage() {
	const { id, data: key } = props
	const memory = await window.mainWindow.redis.memoryUsage(id, key)
	memoryUsage.value = memory || 0
}

// key edit status
const keyEditing = ref(false)
const keyEditValue = ref<string>()
const keyEditInputRef = ref<HTMLInputElement>()
function enterKeyEdit() {
	keyEditValue.value = props.data
	keyEditing.value = true
	nextTick(() => keyEditInputRef.value.focus())
}
function exitKeyEdit() {
	keyEditing.value = false
}

// key rename
const { isLoading: isRenameLoading, enter: enterRenameLoading, exit: exitRenameLoading } = useLoading()
function handleRenameClick() {
	const dialogInstance = DialogPlugin.confirm({
		header: '重命名键',
		body: `确定将「${props.data}」重命名为「${keyEditValue.value}」?`,
		theme: 'warning',
		onConfirm: async () => {
			try {
				enterRenameLoading()
				await window.mainWindow.redis.rename(props.id, props.data, keyEditValue.value)
				useEventBus(keyRenamedEventKey).emit(keyEditValue.value)
				useEventBus(keyActivedEventKey).emit({ key: keyEditValue.value, id: props.id })
				useEventBus(keyRemovedEventKey).emit(props.data)
				MessagePlugin.success('保存成功')
				dialogInstance.destroy()
			} catch (e) {
				MessagePlugin.error(e.message)
			} finally {
				exitRenameLoading()
			}
		},
		onCancel: () => exitKeyEdit(),
	})
}

// ttl edit status
const ttlEditing = ref(false)
const ttlEditValue = ref<number>()
const ttlEditInputRef = ref<HTMLInputElement>()
function enterTtlEdit() {
	ttlEditValue.value = keyTtl.value
	ttlEditing.value = true
	nextTick(() => ttlEditInputRef.value.focus())
}
function exitTtlEdit() {
	ttlEditing.value = false
}

// ttl edit
const { isLoading: isTtlLoading, enter: enterTtlLoading, exit: exitTtlLoading } = useLoading()
async function handleTtlEditClick() {
	try {
		enterTtlLoading()
		await window.mainWindow.redis.expire(props.id, props.data, ttlEditValue.value)
		exitTtlEdit()
		initKeyTtl()
		initKeyValue()
		MessagePlugin.success('保存成功')
	} catch (e) {
		MessagePlugin.error(e.message)
	} finally {
		exitTtlLoading()
	}
}

// remove key
const { isLoading: isRemoveLoading, enter: enterRemoveLoading, exit: exitRemoveLoading } = useLoading()
function handleRemoveClick() {
	const dialogInstance = DialogPlugin.confirm({
		header: '删除键',
		body: '确定要删除该键吗？',
		theme: 'danger',
		confirmBtn: { loading: isRemoveLoading.value },
		onConfirm: async () => {
			try {
				enterRemoveLoading()
				await window.mainWindow.redis.del(props.id, props.data)
				useEventBus(keyRemovedEventKey).emit(props.data)
				MessagePlugin.success('删除成功')
				dialogInstance.destroy()
			} catch (e) {
				MessagePlugin.error(e.message)
			} finally {
				exitRemoveLoading()
			}
		},
	})
}

// auto refresh
function handleAutoRefreshClick() {
	initKeyValue()
	initKeyTtl()
	initMemoryUsage()
}

// generate copy button
const { CopyButton } = useCopyButton({ source: '123', autoCopy: true, buttonProps: { size: 'small' } })

// generate body component
const bodyComponent = computed(() => {
	if (keyType.value === 'string') return StringEditor
	if (keyType.value === 'hash') return HashEditor
})

// editor language
const language = ref('')

// editor visible
const editorVisible = computed(() => keyType.value === 'string')
</script>

<style scoped lang="scss">
.key-edit {
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.header {
	display: flex;
	align-items: center;
	background-color: var(--td-bg-color-page);
	transition: all var(--td-transition);
	border-bottom: 1px solid var(--td-component-stroke);

	&_title {
		display: flex;
		align-items: center;
		flex: 1;
		overflow: hidden;
		padding: var(--td-comp-paddingLR-s) 0 var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-m);

		&_key {
			display: flex;
			align-items: center;
			flex: 1;
			gap: var(--td-comp-margin-m);
			font: var(--td-font-title-medium);
			color: var(--td-text-color-primary);
			overflow: hidden;
		}

		&_ttl {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-m);
			font: var(--td-font-body-medium);
			color: var(--td-text-color-secondary);
		}

		&_input {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-xs);
			flex: 1;
		}

		.text-ellipsis {
			cursor: text;
		}
	}

	&_action {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-m);
		padding-right: var(--td-comp-paddingLR-m);
	}

	&_divider {
		height: var(--td-line-height-body-medium);
		width: 1px;
		background-color: var(--td-component-border);
		margin: 0 var(--td-comp-paddingLR-m);
	}
}

.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m);
	overflow: hidden;

	&_actions {
		display: flex;
		justify-content: space-between;
		gap: var(--td-comp-margin-s);

		&_prefix {
			display: flex;
			gap: var(--td-comp-margin-s);
		}
	}

	&_content {
		flex: 1;
		overflow: hidden;
	}
}
</style>
