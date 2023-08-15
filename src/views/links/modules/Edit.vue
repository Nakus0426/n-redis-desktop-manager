<template>
	<Dialog
		v-model:visible="visible"
		title="新增连接"
		icon="fluent:add-circle-20-regular"
		:width="800"
		:close-on-overlay-click="false"
		:confirm-btn="confirmButtonProps"
		@confirm="handleConfirmClick()"
		@closed="handleDialogClosed()"
	>
		<div class="edit">
			<TForm label-align="top" :rules="rules" :data="data" ref="formRef">
				<div class="body">
					<TFormItem label="名称" name="name">
						<TInput v-model="data.name" clearable />
					</TFormItem>
					<TFormItem label="地址" name="host">
						<TInput v-model="data.host" clearable />
					</TFormItem>
					<TFormItem label="端口" name="port">
						<TInputNumber v-model="data.port" name="port" theme="column" min="0" :input-props="{ clearable: true }" />
					</TFormItem>
					<TFormItem label="用户名" name="username">
						<TInput v-model="data.username" clearable />
					</TFormItem>
					<TFormItem label="密码" name="password">
						<TInput v-model="data.password" clearable type="password" />
					</TFormItem>
					<TFormItem class="display-type" label="数据展示形式" name="separator">
						<template #statusIcon>
							<HelpTooltip>
								<template #content>
									<div>1、“树形”：连接将按指定的“分隔符”分割成树形展示</div>
									<div>2、“平铺”：连接将平铺展示所有数据</div>
								</template>
							</HelpTooltip>
						</template>
						<TInputAdornment>
							<template #prepend>
								<TSelect v-model="displayType">
									<TOption value="tree" label="树形" title="树形">
										<div class="display-type-item">
											<Icon height="16" width="16" icon="fluent:text-bullet-list-tree-20-regular" />
											<span>树形</span>
										</div>
									</TOption>
									<TOption value="list" label="平铺" title="平铺">
										<div class="display-type-item">
											<Icon height="16" width="16" icon="fluent:text-bullet-list-ltr-20-regular" />
											<span>平铺</span>
										</div>
									</TOption>
								</TSelect>
							</template>
							<TInput v-model="data.separator" placeholder="请输入分隔符" :disabled="isDisplayTypeList" clearable />
						</TInputAdornment>
					</TFormItem>
				</div>
			</TForm>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { type FormRules, type FormInstanceFunctions, ButtonProps, MessagePlugin } from 'tdesign-vue-next'
import { type Link, useLinksStore } from '@/store'
import { nanoid } from 'nanoid'

// open
const visible = ref(false)
async function open() {
	visible.value = true
}

// form rules
const rules = computed<FormRules>(() => ({
	name: [{ required: true }],
	host: [{ required: true }],
	port: [{ required: true }],
	separator: [{ required: !isDisplayTypeList.value, message: '分隔符必填' }],
}))

// display type
type DisplayType = 'tree' | 'list'
const displayType = ref<DisplayType>('tree')
const isDisplayTypeList = computed(() => displayType.value === 'list')

// data
function createData() {
	return {
		id: nanoid(),
		name: null,
		host: '127.0.0.1',
		port: 6739,
		username: null,
		password: null,
		separator: null,
	}
}
const data = ref<Link>(createData())

// confirm
const formRef = ref<FormInstanceFunctions>()
const loading = ref(false)
const confirmButtonProps = computed<ButtonProps>(() => ({ loading: loading.value }))
async function handleConfirmClick() {
	try {
		loading.value = true
		const validate = await formRef.value.validate()
		if (validate !== true) return
		await useLinksStore().addLinks(data.value)
		MessagePlugin.success('新增成功')
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

	.display-type {
		:deep(.t-form__item),
		:deep(.t-input__wrap),
		:deep(.t-input-adornment) {
			overflow: hidden;
		}

		:deep(.t-input-adornment) {
			flex: 1;
		}

		:deep(.t-select-input) {
			width: 100px;
		}
	}

	:global(.display-type-item) {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		width: 100px;
	}

	:deep(.t-input-number) {
		flex: 1;
	}
}
</style>
