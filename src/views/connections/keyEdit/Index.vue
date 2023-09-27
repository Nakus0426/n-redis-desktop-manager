<template>
	<div class="key-edit">
		<div ref="headerReferenceRef" />
		<div class="header" :class="headerClass">
			<div class="header_title">
				<div class="header_title_key">
					<TTag variant="light-outline" theme="primary">{{ upperFirst(keyType) }}</TTag>
					<TextEllipsis :content="keyEditValue" @click="enterKeyEdit()" v-show="!keyEditing" />
					<input
						class="key-input"
						v-model="keyEditValue"
						ref="keyEditInputRef"
						v-show="keyEditing"
						@blur="exitKeyEdit()"
					/>
				</div>
				<div class="header_title_ttl">
					<TTag variant="light-outline" theme="primary">TTL</TTag>
					<div v-show="!ttlEditing" @click="enterTtlEdit()">{{ keyTtl }}</div>
					<input
						class="ttl-input"
						v-model="ttlEditValue"
						ref="ttlEditInputRef"
						v-show="ttlEditing"
						@blur="exitTtlEdit()"
					/>
				</div>
			</div>
			<div class="header_action">
				<TButton theme="primary" shape="square" variant="text" :disabled="!saveAvaliable">
					<Icon height="20" width="20" icon="fluent:save-20-regular" />
				</TButton>
				<TButton theme="danger" shape="square" variant="text" @click="handleRemoveClick()">
					<Icon height="20" width="20" icon="fluent:delete-20-regular" />
				</TButton>
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
import { keyRemovedEventKey } from '../keys'

defineOptions({ name: 'ConnectionsKeyEditIndex' })

const props = defineProps<{ keyValue: string; id: string }>()

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
async function initKeyValue() {
	const value = await window.mainWindow.redis.get(props.id, props.keyValue)
	console.log(value)
}

// init key type
const keyType = ref<KeyType>()
async function initKeyType() {
	const type = await window.mainWindow.redis.type(props.id, props.keyValue)
	keyType.value = type || '-'
}

// init key ttl
const keyTtl = ref<number | string>()
async function initKeyTtl() {
	const ttl = await window.mainWindow.redis.ttl(props.id, props.keyValue)
	console.log(ttl)
	keyTtl.value = ttl || '-'
}

// key edit status
const keyEditing = ref(false)
const keyEditValue = ref(props.keyValue)
const keyEditInputRef = ref<HTMLInputElement>()
function enterKeyEdit() {
	keyEditing.value = true
	nextTick(() => keyEditInputRef.value.focus())
}
function exitKeyEdit() {
	keyEditing.value = false
}

// ttl edit status
const ttlEditing = ref(false)
const ttlEditValue = ref<number | string>()
const ttlEditInputRef = ref<HTMLInputElement>()
function enterTtlEdit() {
	ttlEditing.value = true
	ttlEditValue.value = keyTtl.value
	nextTick(() => ttlEditInputRef.value.focus())
}
function exitTtlEdit() {
	ttlEditing.value = false
}

// save avaliable
const isKeyChanged = computed(() => keyEditValue.value !== props.keyValue)
const isTtlChanged = computed(() => ttlEditValue.value !== 0)
const saveAvaliable = computed(() => isKeyChanged.value || isTtlChanged.value)

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
				await window.mainWindow.redis.del(props.id, props.keyValue)
				useEventBus(keyRemovedEventKey).emit(props.keyValue)
				MessagePlugin.success('删除成功')
				dialogInstance.destroy()
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
	gap: var(--td-comp-margin-m);
	background-color: var(--td-bg-color-page);
	border-bottom: 1px solid transparent;
	transition: all var(--td-transition);

	&.is-sticky {
		border-bottom: 1px solid var(--td-component-stroke);
		background-color: var(--td-bg-color-secondarycontainer);
	}

	&_title {
		display: flex;
		flex-direction: column;
		gap: var(--td-comp-margin-s);
		flex: 1;
		overflow: hidden;
		padding: var(--td-comp-paddingLR-m) 0 var(--td-comp-paddingLR-m) var(--td-comp-paddingLR-m);

		&_key {
			display: flex;
			align-items: center;
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

		.key-input,
		.ttl-input {
			width: 100%;
			border: none;
			background-color: transparent;

			&:focus-visible {
				outline: none;
			}
		}

		.key-input {
			height: 24px;
			font: var(--td-font-title-medium);
			color: var(--td-text-color-primary);
		}

		.ttl-input {
			height: 22px;
			font: var(--td-font-body-medium);
			color: var(--td-text-color-secondary);
		}
	}

	&_action {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-m);
		padding-right: var(--td-comp-paddingLR-m);
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
