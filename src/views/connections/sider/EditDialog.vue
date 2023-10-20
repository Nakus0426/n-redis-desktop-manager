<template>
	<Dialog
		v-model:visible="visible"
		:title="title.text"
		:icon="title.icon"
		width="800px"
		:close-on-overlay-click="false"
		:close-on-esc-key-down="!connectTesting"
		:close-btn="!connectTesting"
		placement="center"
		@closed="handleDialogClosed()"
	>
		<div class="edit" id="connectionEdit">
			<TForm label-align="top" :rules="rules" :data="data" ref="formRef">
				<div class="body">
					<TFormItem :label="t('connections.edit.name')" name="name">
						<TInput v-model="data.name" clearable />
					</TFormItem>
					<TFormItem :label="t('connections.edit.host')" name="host">
						<TInput v-model="data.host" clearable />
					</TFormItem>
					<TFormItem :label="t('connections.edit.port')" name="port">
						<TInputNumber v-model="data.port" name="port" theme="column" min="0" :input-props="{ clearable: true }" />
					</TFormItem>
					<TFormItem :label="t('connections.edit.username')" name="username">
						<TInput v-model="data.username" clearable />
					</TFormItem>
					<TFormItem :label="t('connections.edit.password')" name="password">
						<TInput v-model="data.password" clearable type="password" />
					</TFormItem>
					<TFormItem :label="t('connections.edit.separator')">
						<TInput v-model="data.separator" clearable />
						<template #statusIcon>
							<HelpTooltip content="当展示形式为“树形”时，键将按“分隔符”进行分割"></HelpTooltip>
						</template>
					</TFormItem>
					<TFormItem :label="t('connections.edit.display')">
						<div class="display">
							<div class="display_item" :class="displayActivedClass('list')" @click="handleDisplayChange('list')">
								<div class="display_item_icon list" v-ripple></div>
								<div class="display_item_title">列表</div>
							</div>
							<div class="display_item" :class="displayActivedClass('tree')" @click="handleDisplayChange('tree')">
								<div class="display_item_icon tree" v-ripple></div>
								<div class="display_item_title">树形</div>
							</div>
						</div>
					</TFormItem>
				</div>
			</TForm>
		</div>
		<template #footer>
			<div class="footer">
				<div class="prefix">
					<TPopup
						:visible="connectTestResultPopupVisible"
						:overlay-class-name="`connect-test-result-popup ${connectTestResultPopupStatus.class}`"
					>
						<template #content>
							<div class="connect-test-result-popup_content" ref="connectTestResultPopupContentRef">
								<div class="connect-test-result-popup_content_header">
									<div
										class="connect-test-result-popup_content_header_title"
										:class="connectTestResultPopupStatus.class"
									>
										<Icon height="16" width="16" :icon="connectTestResultPopupStatus.icon"></Icon>
										<span>{{ connectTestResultPopupStatus.title }}</span>
									</div>
									<div
										class="connect-test-result-popup_content_header_close"
										:class="connectTestResultPopupStatus.class"
										v-ripple
										@click="connectTestResultPopupVisible = false"
									>
										<Icon height="16" width="16" icon="fluent:dismiss-16-regular" />
									</div>
								</div>
								<div class="connect-test-result-popup_content_body" v-show="connectTestResultError">
									{{ connectTestResultError }}
								</div>
							</div>
						</template>
						<TButton variant="text" theme="primary" :loading="connectTesting" @click="handleConnectTestClick()">
							<template #icon>
								<Icon height="16" width="16" icon="fluent:plug-connected-20-regular" />
							</template>
							<span>测试连接</span>
						</TButton>
					</TPopup>
				</div>
				<div class="suffix">
					<TButton theme="default" :disabled="connectTesting" @click="visible = false">取消</TButton>
					<TButton :disabled="connectTesting" :loading="confirmLoading" @click="handleConfirmClick()">保存</TButton>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import { type FormRules, type FormInstanceFunctions, MessagePlugin } from 'tdesign-vue-next'
import { onClickOutside } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { cloneDeep } from 'lodash-es'
import { useLoading, useLocale } from '@/hooks'
import { type Connection, useConnectionsStore } from '@/store'

defineOptions({ name: 'ConnectionsSiderEditDialog' })

const emit = defineEmits<{ (event: 'update', id: string) }>()

const { t } = useLocale()
const connectionsStore = useConnectionsStore()

// open
const isEdit = ref(false)
const visible = ref(false)
async function open(id?: string) {
	isEdit.value = !!id
	if (isEdit.value) {
		data.value = cloneDeep(connectionsStore.connections.find(connection => connection.id === id))
	}
	visible.value = true
}

// dialog title
const title = computed(() => {
	return {
		text: isEdit.value ? t('connections.edit.title.edit') : t('connections.edit.title.add'),
		icon: isEdit.value ? 'fluent:settings-24-regular' : 'fluent:add-circle-24-regular',
	}
})

// form rules
const rules = computed<FormRules>(() => ({
	name: [{ required: true }],
	host: [{ required: true }],
	port: [{ required: true }],
}))

// data
function createData(): Connection {
	return {
		id: nanoid(),
		name: null,
		host: '127.0.0.1',
		port: 6379,
		username: null,
		password: null,
		separator: ':',
		display: 'list',
	}
}
const data = ref<Connection>(createData())

// display switch
function displayActivedClass(display: Connection['display']) {
	return data.value.display === display ? 'is-actived' : ''
}
function handleDisplayChange(display: Connection['display']) {
	data.value.display = display
}

// test connectivity
const connectTestResultPopupVisible = ref(false)
const connectTestResultPopupStatus = computed(() => ({
	class: connectTestResult.value ? 'is-success' : 'is-error',
	title: connectTestResult.value ? '连接成功' : '连接失败',
	icon: connectTestResult.value ? 'fluent:cloud-checkmark-16-regular' : 'fluent:cloud-dismiss-16-regular',
}))
const connectTestResultError = ref<string>()
const connectTestResult = ref(false)
const { isLoading: connectTesting, enter: enterConnectTesting, exit: exitConnectTesting } = useLoading()
async function handleConnectTestClick() {
	try {
		connectTestResultPopupVisible.value = false
		enterConnectTesting()
		const validate = await formRef.value.validate()
		if (validate !== true) return
		connectTestResult.value = await connectionsStore.connectTest(data.value)
		connectTestResultError.value = null
		connectTestResultPopupVisible.value = true
	} catch (error) {
		connectTestResult.value = false
		connectTestResultError.value = error
		connectTestResultPopupVisible.value = true
	} finally {
		exitConnectTesting()
	}
}

// test connectivity popup on click outside
const connectTestResultPopupContentRef = ref(null)
onClickOutside(connectTestResultPopupContentRef, () => {
	connectTestResultPopupVisible.value = false
})

// confirm
const formRef = ref<FormInstanceFunctions>()
const { isLoading: confirmLoading, enter: enterConfirmLoading, exit: exitConfirmLoading } = useLoading()
async function handleConfirmClick() {
	try {
		enterConfirmLoading()
		const validate = await formRef.value.validate()
		if (validate !== true) return
		if (isEdit.value) {
			await connectionsStore.updateConnection(data.value)
			emit('update', data.value.id)
		} else {
			await connectionsStore.addConnections(data.value)
		}
		MessagePlugin.success('保存成功')
		visible.value = false
	} catch (error) {
		MessagePlugin.error(error.message)
	} finally {
		exitConfirmLoading()
	}
}

// dialog closed
function handleDialogClosed() {
	data.value = createData()
	connectTestResultPopupVisible.value = false
}

defineExpose({
	open,
})
</script>

<style scoped lang="scss">
.body {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	column-gap: var(--td-comp-margin-xl);
	padding: 0 var(--td-comp-paddingLR-l) var(--td-comp-paddingLR-l) var(--td-comp-paddingLR-l) !important;

	:deep(.t-input-number) {
		flex: 1;
	}
}

.display {
	display: flex;
	gap: var(--td-comp-margin-m);

	&_item {
		display: flex;
		flex-direction: column;
		border-radius: var(--td-radius-medium);

		&_icon {
			height: 60px;
			width: 60px;
			border-radius: var(--td-radius-medium);
			border: 1px solid var(--td-component-stroke);
			outline: solid 2px transparent;
			transition: outline var(--td-transition);
			cursor: pointer;
			--ripple-color: var(--td-bg-color-container-active);

			&:hover {
				outline: solid 2px var(--td-brand-color-focus);
			}

			&.tree {
				background: url(@/assets/images/display_tree_light.svg) no-repeat center center;
			}

			&.list {
				background: url(@/assets/images/display_list_light.svg) no-repeat center center;
			}
		}

		&_title {
			font: var(--td-font-body-small);
			color: var(--td-text-color-secondary);
		}

		&.is-actived .display_item_icon {
			border: 2px solid var(--td-brand-color);
		}
	}
}

.footer {
	display: flex;
	justify-content: space-between;
}

[theme-mode='dark'] {
	.list {
		background: url(@/assets/images/display_list_dark.svg) no-repeat center center;
	}

	.tree {
		background: url(@/assets/images/display_tree_dark.svg) no-repeat center center;
	}
}

.connect-test-result-popup_content {
	font: var(--td-font-body-medium);
	max-width: 400px;

	&_header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--td-comp-margin-m);

		&_title {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-xs);

			&.is-success {
				color: var(--td-success-color);
			}

			&.is-error {
				color: var(--td-error-color);
			}
		}

		&_close {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 16px;
			height: 16px;
			color: var(--td-text-color-secondary);
			border-radius: var(--td-radius-default);
			transition: all var(--td-transition);
			cursor: pointer;

			&:hover {
				color: var(--td-text-color-primary);
			}

			&.is-success {
				--ripple-color: var(--td-success-color-light-hover);
			}

			&.is-error {
				--ripple-color: var(--td-error-color-light-hover);
			}
		}
	}

	&_body {
		color: var(--td-text-color-secondary);
	}
}

:global(.connect-test-result-popup.is-success .t-popup__content) {
	background-color: var(--td-success-color-light);
	border: 1px solid var(--td-success-color);
}

:global(.connect-test-result-popup.is-error .t-popup__content) {
	background-color: var(--td-error-color-light);
	border: 1px solid var(--td-error-color);
}
</style>
