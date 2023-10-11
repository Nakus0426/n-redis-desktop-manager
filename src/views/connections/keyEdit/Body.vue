<template>
	<div class="key-edit-body">
		<div class="header">
			<div class="header_prefix">
				<TSelect size="small" borderless auto-width v-model="language">
					<TOption label="Text" value="" />
					<TOption label="JSON" value="json" />
				</TSelect>
				<TTag theme="primary" variant="light">128MB</TTag>
			</div>
			<div class="header_suffix"><CopyButton /></div>
		</div>
		<Editor class="body" :language="language" />
	</div>
</template>

<script setup lang="ts">
import { useCopyButton } from '@/hooks'

defineOptions({ name: 'ConnectionsKeyEditBody' })

const { CopyButton } = useCopyButton({ source: '123', autoCopy: true, buttonProps: { size: 'small' } })

const language = ref('')
</script>

<style scoped lang="scss">
.key-edit-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);
	padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m) var(--td-comp-paddingTB-m);
	overflow: hidden;
}

.header {
	display: flex;
	justify-content: space-between;
	gap: var(--td-comp-margin-s);

	&_prefix {
		display: flex;
		gap: var(--td-comp-margin-s);
	}
}

.body {
	flex: 1;
	border-radius: var(--td-radius-medium);
	border: 1px solid var(--td-component-stroke);
	overflow: hidden;
}

:deep(.t-button--variant-text) {
	border: none;
}
</style>
