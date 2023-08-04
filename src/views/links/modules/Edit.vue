<template>
	<Dialog
		v-model:visible="visible"
		title="新增连接"
		icon="fluent:add-circle-20-regular"
		:width="800"
		:close-on-overlay-click="false"
		@confirm="handleConfirmClick()"
	>
		<div class="edit">
			<TForm label-align="top">
				<div class="body">
					<TFormItem label="名称">
						<TInput />
					</TFormItem>
					<TFormItem label="地址">
						<TInput placeholder="127.0.0.1" />
					</TFormItem>
					<TFormItem label="端口">
						<TInput placeholder="6379" />
					</TFormItem>
					<TFormItem label="用户名">
						<TInput />
					</TFormItem>
					<TFormItem label="密码">
						<TInput />
					</TFormItem>
					<TFormItem label="分隔符" help="分隔符不为空则数据以树状显示，否则数据以列表显示">
						<TInput />
					</TFormItem>
				</div>
			</TForm>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
const visible = ref(false)

// open
async function open() {
	visible.value = true
}

async function handleConfirmClick() {}

defineExpose({
	open,
})
</script>

<style scoped lang="scss">
.edit {
	padding: 0 var(--td-comp-paddingLR-xl) var(--td-comp-paddingLR-xl) var(--td-comp-paddingLR-xl);
}

.body {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	column-gap: var(--td-comp-margin-xl);
}
</style>
