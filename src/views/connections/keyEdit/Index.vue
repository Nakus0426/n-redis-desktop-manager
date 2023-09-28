<template>
	<div class="key-edit">
		<div ref="headerReferenceRef" />
		<div class="header" :class="headerClass">
			<div class="header_title">
				<div class="header_title_key">
					<TTag variant="light-outline" theme="primary">{{ upperFirst(keyType) }}</TTag>
					<TextEllipsis :content="data" @click="enterKeyEdit()" v-show="!keyEditing" />
					<div class="header_title_input" v-show="keyEditing">
						<TInput size="small" ref="keyEditInputRef" v-model="keyEditValue" />
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
					<TTag variant="light-outline" theme="primary">TTL</TTag>
					<div v-show="!ttlEditing" @click="enterTtlEdit()">{{ keyTtl }}</div>
					<div class="header_title_input" v-show="ttlEditing">
						<TInputNumber size="small" theme="normal" ref="ttlEditInputRef" v-model="ttlEditValue" />
						<TButton size="small" variant="text" theme="success" shape="square">
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
				<TTooltip content="刷新" placement="top" :show-arrow="false">
					<TButton theme="primary" shape="square" variant="text">
						<Icon height="20" width="20" icon="fluent:arrow-sync-20-regular" />
					</TButton>
				</TTooltip>
				<TTooltip content="删除" placement="top" :show-arrow="false">
					<TButton theme="danger" shape="square" variant="text" @click="handleRemoveClick()">
						<Icon height="20" width="20" icon="fluent:delete-20-regular" />
					</TButton>
				</TTooltip>
			</div>
		</div>
		<div class="body">
			<h1 v-for="item in 20">123</h1>
		</div>
		<TTooltip :show-arrow="false" :content="autoRefreshButtonStyle.tooltipContent" placement="left">
			<button class="auto-refresh" v-ripple @click="handleAutoRefreshClick()">
				<Icon height="24" width="24" :icon="autoRefreshButtonStyle.icon" />
			</button>
		</TTooltip>
	</div>
</template>

<script setup lang="ts">
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { useEventBus, useIntersectionObserver } from '@vueuse/core'
import { upperFirst } from 'lodash-es'
import { type KeyType } from '@/utils'
import { useLoading } from '@/hooks'
import { keyActivedEventKey, keyRemovedEventKey, keyRenamedEventKey } from '../keys'

defineOptions({ name: 'ConnectionsKeyEditIndex' })

const props = defineProps<{ data: string; id: string }>()

// init data
onMounted(async () => {
	await initKeyType()
	initKeyValue()
	initKeyTtl()
})

// generate header styles
const headerReferenceRef = ref<HTMLElement>()
const headerClass = ref<string>()
useIntersectionObserver(headerReferenceRef, ([{ isIntersecting }]) => {
	headerClass.value = isIntersecting ? '' : 'is-sticky'
})

// init key value
const keyValue = ref()
async function initKeyValue() {
	const _value = await window.mainWindow.redis.get(props.id, props.data)
	keyValue.value = _value || ''
}

// init key type
const keyType = ref<KeyType>()
async function initKeyType() {
	const type = await window.mainWindow.redis.type(props.id, props.data)
	keyType.value = type || '-'
}

// init key ttl
const keyTtl = ref<number>()
async function initKeyTtl() {
	const ttl = await window.mainWindow.redis.ttl(props.id, props.data)
	keyTtl.value = ttl
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

// key edit
const { isLoading: isRenameLoading, enter: enterRenameLoading, exit: exitRenameLoading } = useLoading()
async function handleRenameClick() {
	try {
		enterRenameLoading()
		await window.mainWindow.redis.rename(props.id, props.data, keyEditValue.value)
		useEventBus(keyRenamedEventKey).emit(keyEditValue.value)
		nextTick(() => {
			useEventBus(keyActivedEventKey).emit({ key: keyEditValue.value, id: props.id })
			nextTick(() => useEventBus(keyRemovedEventKey).emit(keyEditValue.value))
		})
		MessagePlugin.success('保存成功')
	} catch (e) {
		MessagePlugin.error(e.message)
	} finally {
		exitRenameLoading()
	}
}

// ttl edit
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
const autoRefreshEnable = ref(false)
const autoRefreshButtonStyle = computed(() => ({
	icon: autoRefreshEnable.value ? 'line-md:loading-loop' : 'fluent:arrow-sync-24-regular',
	tooltipContent: autoRefreshEnable.value ? '关闭自动刷新' : '开启自动刷新',
}))
let autoRefreshInterval: NodeJS.Timeout
function handleAutoRefreshClick() {
	autoRefreshEnable.value = !autoRefreshEnable.value
	clearInterval(autoRefreshInterval)
	if (autoRefreshEnable.value)
		autoRefreshInterval = setInterval(async () => {
			initKeyValue()
			initKeyTtl()
		}, 1000)
}
</script>

<style scoped lang="scss">
.key-edit {
	position: relative;
	display: flex;
	flex-direction: column;
}

.header {
	position: sticky;
	top: 0;
	display: flex;
	align-items: center;
	background-color: var(--td-bg-color-page);
	border-bottom: 1px solid transparent;
	transition: all var(--td-transition);

	&.is-sticky {
		box-shadow: 0 3px 2px -2px rgba(0, 0, 0, 6%);
		background-color: var(--td-bg-color-secondarycontainer);
	}

	&_title {
		display: flex;
		align-items: center;
		flex: 1;
		overflow: hidden;
		padding: var(--td-comp-paddingLR-m) 0 var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m);

		&_key {
			display: flex;
			align-items: center;
			flex: 1;
			gap: var(--td-comp-margin-m);
			font: var(--td-font-title-medium);
			color: var(--td-text-color-primary);
			overflow: hidden;
			cursor: text;
		}

		&_ttl {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-m);
			font: var(--td-font-body-medium);
			color: var(--td-text-color-secondary);
			cursor: text;
		}

		&_input {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-xs);
			flex: 1;
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

	:deep(.t-button--variant-text) {
		border: none;
		--ripple-color: var(--td-bg-color-secondarycontainer-active);

		&:hover {
			background-color: var(--td-bg-color-container-active);
		}
	}
}

.auto-refresh {
	position: fixed;
	right: var(--td-comp-paddingLR-m);
	bottom: var(--td-comp-paddingLR-m);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--td-component-border);
	border-radius: var(--td-radius-medium);
	background-color: var(--td-bg-color-container);
	color: var(--td-text-color-primary);
	box-shadow: var(--td-shadow-3);
	transition: all var(--td-transition);
	cursor: pointer;
	z-index: 500;
	--ripple-color: var(--td-bg-color-container-active);

	&:hover {
		background-color: var(--td-bg-color-container-hover);
	}

	&:focus-visible {
		outline: none;
		border-color: var(--td-brand-color);
		color: var(--td-brand-color);
	}
}
</style>
