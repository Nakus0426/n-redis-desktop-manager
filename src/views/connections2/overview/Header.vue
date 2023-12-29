<template>
	<div class="overview_header">
		<div class="header">Server Information {{ isLoading }}</div>
		<TTabs class="body" placement="left" default-value="server">
			<TTabPanel value="server" label="Server">
				<TabPanelContent :data="data?.Server ?? {}" />
			</TTabPanel>
			<TTabPanel value="clients" label="Clients">
				<TabPanelContent :data="data?.Clients ?? {}" />
			</TTabPanel>
			<TTabPanel value="memory" label="Memory">
				<TabPanelContent :data="data?.Memory ?? {}" />
			</TTabPanel>
			<TTabPanel value="persistence" label="Persistence">
				<TabPanelContent :data="data?.Persistence ?? {}" />
			</TTabPanel>
			<TTabPanel value="stats" label="Stats">
				<TabPanelContent :data="data?.Stats ?? {}" />
			</TTabPanel>
			<TTabPanel value="replication" label="Replication">
				<TabPanelContent :data="data?.Replication ?? {}" />
			</TTabPanel>
			<TTabPanel value="cpu" label="Cpu">
				<TabPanelContent :data="data?.CPU ?? {}" />
			</TTabPanel>
			<TTabPanel value="cluster" label="Cluster">
				<TabPanelContent :data="data?.Cluster ?? {}" />
			</TTabPanel>
			<TTabPanel value="modules" label="Modules">
				<TabPanelContent :data="data?.Modules ?? {}" />
			</TTabPanel>
			<TTabPanel value="errorstats" label="Errorstats">
				<TabPanelContent :data="data?.Errorstats ?? {}" />
			</TTabPanel>
		</TTabs>
	</div>
</template>

<script setup lang="tsx">
import { Button as TButton, Tooltip as TTooltip, Loading as TLoading } from 'tdesign-vue-next'
import { useClipboard } from '@vueuse/core'
import { connectionInfoInjectKey } from '../keys'
import TextEllipsis from '@/components/TextEllipsis.vue'
import { Icon } from '@iconify/vue'
import { useLoading } from '@/hooks'

const { data, isLoading } = inject(connectionInfoInjectKey)

// tab panel content
function TabPanelContent(props: { data: Record<string, string> }) {
	return (
		<TLoading class="tab-panel-content" loading={isLoading.value}>
			{Object.entries(props.data).map(([key, value]) => (
				<div class="tab-panel-content-item">
					<div class="tab-panel-content-item-label">
						<div class="tab-panel-content-item-label-prefix">
							<TextEllipsis content={key} />
						</div>
						<div class="tab-panel-content-item-label-suffix">
							<TTooltip placement="top" content="复制值" showArrow={false}>
								<TButton
									size="small"
									variant="text"
									shape="square"
									theme="primary"
									icon={() => <Icon height="14" width="14" icon={generateCopyIcon(value)} />}
									onClick={() => handleCopyClick(value)}
								/>
							</TTooltip>
						</div>
					</div>
					<div class="tab-panel-content-item-value">{value || '-'}</div>
				</div>
			))}
		</TLoading>
	)
}

// copy value
const { copy, copied, text: copiedText } = useClipboard()
const { isLoading: isCopyLoading, enter: enterCopyLoading, exit: exitCopyLoading } = useLoading()
function generateCopyIcon(value: string) {
	if (copiedText.value !== value) return 'fluent:copy-select-20-regular'
	if (isCopyLoading.value) return 'line-md:loading-loop'
	if (!isCopyLoading.value && copied.value) return 'fluent:checkmark-16-regular'
	return 'fluent:copy-select-20-regular'
}
async function handleCopyClick(value: string) {
	try {
		enterCopyLoading()
		await copy(value)
	} finally {
		exitCopyLoading()
	}
}
</script>

<style scoped lang="scss">
.overview_header {
	display: flex;
	flex-direction: column;
}

.header {
	position: sticky;
	top: 0;
	font: var(--td-font-title-medium);
	color: var(--td-text-color-primary);
	padding: var(--td-comp-paddingTB-m);
	background-color: var(--td-bg-color-container-opacity);
	backdrop-filter: blur(15px);
	z-index: 3;

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: var(--td-comp-paddingLR-m);
		height: 1px;
		width: calc(100% - var(--td-comp-paddingLR-m) * 2);
		background-color: var(--td-component-stroke);
	}
}

.body {
	overflow: initial;
	padding: var(--td-comp-paddingTB-m);

	:deep(.t-tabs__nav-item.t-size-m) {
		height: var(--td-comp-size-xl);
		line-height: var(--td-comp-size-xl);
	}

	:deep(.t-tabs__nav-item-wrapper) {
		flex: 1;
	}
}

.tab-panel-content {
	display: grid;
	gap: var(--td-comp-margin-s);
	padding-left: var(--td-comp-paddingTB-s);
}

@media (min-width: 1024px) and (max-width: 1280px) {
	.tab-panel-content {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (min-width: 1280px) and (max-width: 1536px) {
	.tab-panel-content {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (min-width: 1536px) {
	.tab-panel-content {
		grid-template-columns: repeat(4, 1fr);
	}
}

:deep(.t-tabs__header) {
	position: sticky;
	top: 60px;
}

:deep(.tab-panel-content-item) {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--td-component-stroke);
	border-radius: var(--td-radius-medium);
	padding: var(--td-comp-paddingLR-s);
	background-image: linear-gradient(120deg, var(--td-bg-color-container) 45%, var(--td-bg-color-container-hover));
	font: var(--td-font-body-medium);
	overflow: hidden;
	user-select: text;

	&:hover .tab-panel-content-item-label-suffix {
		visibility: visible;
		opacity: 1;
	}
}

:deep(.tab-panel-content-item-label) {
	display: flex;
	align-items: center;
	gap: var(--td-comp-margin-s);
}

:deep(.tab-panel-content-item-label-prefix) {
	color: var(--td-text-color-primary);
	flex: 1;
}

:deep(.tab-panel-content-item-label-suffix) {
	visibility: hidden;
	opacity: 0;
	transition: all var(--td-transition);
}

:deep(.tab-panel-content-item-value) {
	color: var(--td-text-color-secondary);
	word-break: break-all;
}
</style>
