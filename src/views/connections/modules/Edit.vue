<template>
	<Dialog
		v-model:visible="visible"
		:title="title.text"
		:icon="title.icon"
		:width="800"
		:close-on-overlay-click="false"
		:confirm-btn="confirmButtonProps"
		@confirm="handleConfirmClick()"
		@closed="handleDialogClosed()"
	>
		<div class="edit">
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
	</Dialog>
</template>

<script setup lang="ts">
import { type FormRules, type FormInstanceFunctions, ButtonProps, MessagePlugin } from 'tdesign-vue-next'
import { nanoid } from 'nanoid'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks'
import { type Connection, useConnectionsStore } from '@/store'

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
		icon: isEdit.value ? 'fluent:settings-20-regular' : 'fluent:add-circle-20-regular',
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

// confirm
const formRef = ref<FormInstanceFunctions>()
const loading = ref(false)
const confirmButtonProps = computed<ButtonProps>(() => ({ loading: loading.value }))
async function handleConfirmClick() {
	try {
		loading.value = true
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
	} finally {
		loading.value = false
	}
}

// dialog closed
function handleDialogClosed() {
	data.value = createData()
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

[theme-mode='dark'] {
	.list {
		background: url(@/assets/images/display_list_dark.svg) no-repeat center center;
	}

	.tree {
		background: url(@/assets/images/display_tree_dark.svg) no-repeat center center;
	}
}
</style>
