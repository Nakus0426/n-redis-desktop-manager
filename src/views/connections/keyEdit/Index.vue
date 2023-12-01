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
						<TextEllipsis :content="`${keyTtl}s`" v-show="!ttlEditing" @click="enterTtlEdit()" />
					</TTooltip>
					<div class="header_title_input" v-show="ttlEditing">
						<TInputNumber
							size="small"
							theme="normal"
							ref="ttlEditInputRef"
							v-model="ttlEditValue"
							@enter="handleTTLEditClick()"
						/>
						<TButton
							size="small"
							variant="text"
							theme="success"
							shape="square"
							:loading="isTtlLoading"
							@click="handleTTLEditClick()"
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
			<component class="body_content" :is="bodyComponent" />
		</div>
		<AutoRefresh @refresh="handleAutoRefreshClick()" />
	</div>
</template>

<script setup lang="ts">
import { DialogPlugin } from 'tdesign-vue-next'
import { upperFirst } from 'lodash-es'
import { type KeyType } from '@/utils'
import { keyEditInjectKey, keyEditUpdatedEventKey } from '../keys'
import AutoRefresh from '../components/AutoRefresh.vue'
import StringEditor from './StringEditor.vue'
import HashEditor from './HashEditor.vue'
import SetEditor from './SetEditor.vue'
import { useKeyRemove, useKeyRename, useTTLUpdate } from '../hooks'
import { useEventBus } from '@vueuse/core'

const props = defineProps<{ data: string; id: string }>()

// provide data
const injectData = computed(() => ({
	id: props.id,
	key: props.data,
	value: keyValue.value,
	type: keyType.value,
	ttl: keyTtl.value,
	memoryUsage: memoryUsage.value,
}))
provide(keyEditInjectKey, injectData)

// init data
onMounted(async () => {
	await initKeyType()
	handleAutoRefreshClick()
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
const { isLoading: isRenameLoading, execute: rename } = useKeyRename(props.id)
function handleRenameClick() {
	rename(props.data, keyEditValue.value)
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
const { isLoading: isTtlLoading, execute: updateTTL } = useTTLUpdate(props.id)
async function handleTTLEditClick() {
	await updateTTL(props.data, ttlEditValue.value)
	exitTtlEdit()
	handleAutoRefreshClick()
}

// remove key
const { isLoading: isRemoveLoading, execute: removeKey } = useKeyRemove(props.id)
function handleRemoveClick() {
	const dialogInstance = DialogPlugin.confirm({
		header: '删除确认',
		body: '确定要删除该键吗？',
		theme: 'danger',
		confirmBtn: { loading: isRemoveLoading.value, theme: 'danger', variant: 'outline' },
		onConfirm: async () => {
			await removeKey(props.data)
			dialogInstance.destroy()
		},
	})
}

// auto refresh
function handleAutoRefreshClick() {
	initKeyValue()
	initKeyTtl()
	initMemoryUsage()
}

// key updated evnent
useEventBus(keyEditUpdatedEventKey).on(() => handleAutoRefreshClick())

// generate body component
const bodyComponent = computed(() => {
	if (keyType.value === 'string') return StringEditor
	if (keyType.value === 'hash') return HashEditor
	if (keyType.value === 'set') return SetEditor
})
</script>

<style scoped lang="scss">
.key-edit {
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: var(--td-comp-paddingLR-m);
}

.header {
	display: flex;
	align-items: center;
	background-color: var(--td-bg-color-container);
	padding-bottom: var(--td-comp-paddingTB-m);
	border-bottom: 1px solid var(--td-component-stroke);

	&_title {
		display: flex;
		align-items: center;
		flex: 1;
		overflow: hidden;

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
	}

	&_divider {
		height: var(--td-line-height-body-medium);
		width: 1px;
		background-color: var(--td-component-stroke);
		margin: 0 var(--td-comp-paddingLR-m);
	}
}

.body {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
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
