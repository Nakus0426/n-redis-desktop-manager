<template>
	<Dialog
		v-model:visible="visible"
		header="新增连接"
		:width="800"
		:close-on-overlay-click="false"
		@confirm="handleConfirmClick()"
	>
		<div class="edit">
			<TForm label-align="top">
				<TRow :gutter="[16, 12]">
					<TCol :span="6">
						<TFormItem label="名称">
							<TInput />
						</TFormItem>
					</TCol>
					<TCol :span="6">
						<TFormItem label="地址">
							<TInput placeholder="127.0.0.1" />
						</TFormItem>
					</TCol>
					<TCol :span="6">
						<TFormItem label="端口">
							<TInput placeholder="6379" />
						</TFormItem>
					</TCol>
					<TCol :span="6">
						<TFormItem label="用户名">
							<TInput />
						</TFormItem>
					</TCol>
					<TCol :span="6">
						<TFormItem label="密码">
							<TInput />
						</TFormItem>
					</TCol>
					<TCol :span="6">
						<TFormItem label="分隔符" help="分隔符不为空则数据以树状显示，否则数据以列表显示">
							<TInput />
						</TFormItem>
					</TCol>
				</TRow>
			</TForm>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
const visible = ref(false)

// open
async function open() {
	visible.value = true
	await window.mainWindow.redis.create({ id: '123', url: 'redis://:chinobot@123@mid1.ccbrain.cn:6379' })
	await window.mainWindow.redis.connect('123')
}

async function handleConfirmClick() {
	console.log(await window.mainWindow.redis.set('123', 'test', '456'))
}

defineExpose({
	open,
})
</script>

<style scoped lang="scss">
.edit {
	padding: 0 var(--td-comp-paddingLR-m) var(--td-comp-paddingTB-xl) var(--td-comp-paddingTB-m);
}
</style>
