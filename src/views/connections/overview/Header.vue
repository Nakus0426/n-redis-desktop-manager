<template>
	<div class="overview_header">
		<TSwiper :duration="500" theme="light">
			<TSwiperItem>
				<div class="cells">
					<Cell
						title="Server"
						icon="fluent:server-16-regular"
						@on-more-click="handleMoreClick('Server', 'fluent:server-24-regular')"
					>
						<CellItem label="Redis Version" :value="connectionInfo?.Server?.redis_version ?? '-'" />
						<CellItem label="Tcp Port" :value="connectionInfo?.Server?.tcp_port ?? '-'" />
						<CellItem label="Redis Mode" :value="connectionInfo?.Server?.redis_mode ?? '-'" />
						<CellItem label="OS" :value="connectionInfo?.Server?.os ?? '-'" />
					</Cell>
					<Cell
						title="Memory"
						icon="fluent:memory-16-regular"
						@on-more-click="handleMoreClick('Memory', 'fluent:memory-16-regular')"
					>
						<CellItem label="Used Memory" :value="connectionInfo?.Memory?.used_memory_human ?? '-'" />
						<CellItem label="Used Memory Peak" :value="connectionInfo?.Memory?.used_memory_peak_human ?? '-'" />
						<CellItem label="Total System Memory" :value="connectionInfo?.Memory?.total_system_memory_human ?? '-'" />
						<CellItem label="Used Memory Dataset" :value="connectionInfo?.Memory?.used_memory_dataset_perc ?? '-'" />
					</Cell>
					<Cell
						title="Clients"
						icon="fluent:calendar-ltr-16-regular"
						@on-more-click="handleMoreClick('Clients', 'fluent:calendar-ltr-24-regular')"
					>
						<CellItem label="Connected Clients" :value="connectionInfo?.Clients?.connected_clients ?? '-'" />
						<CellItem label="Cluster Connections" :value="connectionInfo?.Clients?.cluster_connections ?? '-'" />
						<CellItem label="Maxclients" :value="connectionInfo?.Clients?.maxclients ?? '-'" />
						<CellItem
							label="Clients In Timeout Table"
							:value="connectionInfo?.Clients?.clients_in_timeout_table ?? '-'"
						/>
					</Cell>
				</div>
			</TSwiperItem>
			<TSwiperItem>
				<div class="cells">
					<Cell
						title="CPU"
						icon="fluent:developer-board-16-regular"
						@on-more-click="handleMoreClick('CPU', 'fluent:developer-board-24-regular')"
					>
						<CellItem label="Used Cpu Sys Main" :value="connectionInfo?.CPU?.used_cpu_sys_main_thread ?? '-'" />
						<CellItem label="Used Cpu User Main" :value="connectionInfo?.CPU?.used_cpu_user_main_thread ?? '-'" />
						<CellItem label="Used Cpu Sys Children" :value="connectionInfo?.CPU?.used_cpu_sys_children ?? '-'" />
						<CellItem label="Used Cpu User Children" :value="connectionInfo?.CPU?.used_cpu_user_children ?? '-'" />
					</Cell>
					<Cell
						title="Cluster"
						icon="fluent:server-surface-multiple-16-regular"
						@on-more-click="handleMoreClick('Cluster', 'fluent:server-surface-multiple-16-regular')"
					>
						<CellItem label="Cluster Enabled" :value="connectionInfo?.Cluster?.cluster_enabled ?? '-'" />
					</Cell>
				</div>
			</TSwiperItem>
			<TSwiperItem>
				<div class="cells">
					<Cell
						title="Persistence"
						icon="fluent:save-16-regular"
						@on-more-click="handleMoreClick('Persistence', 'fluent:save-24-regular')"
					>
						<CellItem label="Loading" :value="connectionInfo?.Persistence?.loading ?? '-'" />
						<CellItem label="RDB Bgsave" :value="connectionInfo?.Persistence?.rdb_bgsave_in_progress ?? '-'" />
						<CellItem label="AOF Rewrite" :value="connectionInfo?.Persistence?.aof_rewrite_in_progress ?? '-'" />
						<CellItem label="Module Fork" :value="connectionInfo?.Persistence?.module_fork_in_progress ?? '-'" />
					</Cell>
					<Cell
						title="Stats"
						icon="fluent:chart-multiple-20-regular"
						@on-more-click="handleMoreClick('Stats', 'fluent:chart-multiple-24-regular')"
					>
						<CellItem
							label="Instantaneous Input"
							:value="`${connectionInfo?.Stats?.instantaneous_input_kbps ?? '-'}KB/s`"
						/>
						<CellItem
							label="Instantaneous Output"
							:value="`${connectionInfo?.Stats?.instantaneous_output_kbps ?? '-'}KB/s`"
						/>
						<CellItem
							label="Total Connections Received"
							:value="connectionInfo?.Stats?.total_connections_received ?? '-'"
						/>
						<CellItem
							label="Total_Commands_Processed"
							:value="connectionInfo?.Stats?.total_commands_processed ?? '-'"
						/>
					</Cell>
					<Cell
						title="Replication"
						icon="fluent:save-multiple-16-regular"
						@on-more-click="handleMoreClick('Replication', 'fluent:save-multiple-24-regular')"
					>
						<CellItem label="Role" :value="connectionInfo?.Replication?.role ?? '-'" />
						<CellItem label="Connected Slaves" :value="connectionInfo?.Replication?.connected_slaves ?? '-'" />
						<CellItem label="Master Replid" :value="connectionInfo?.Replication?.master_replid ?? '-'" />
						<CellItem label="Master Replid2" :value="connectionInfo?.Replication?.master_replid2 ?? '-'" />
					</Cell>
				</div>
			</TSwiperItem>
		</TSwiper>
		<InfoDialog ref="infoDialogRef" />
	</div>
</template>

<script setup lang="tsx">
import { type SetupContext } from 'vue'
import { Icon } from '@iconify/vue'
import { connectionInfoInjectKey } from '../keys'
import TextEllipsis from '@/components/TextEllipsis.vue'
import { type ConnectionInfo } from '@/store'
import InfoDialog from './InfoDialog.vue'

defineOptions({ name: 'ConnectionsOverviewHeader' })

const connectionInfo = inject(connectionInfoInjectKey)

// connection info cell component
function Cell(props: { title: string; icon: string }, context: SetupContext) {
	return (
		<div class="cell">
			<div class="cell_header">
				<div class="cell_header_prefix">
					<Icon class="cell_header_prefix_icon" height="16" width="16" icon={props.icon} />
					<div class="cell_header_prefix_title">{props.title}</div>
				</div>
				<button class="cell_header_suffix" v-ripple onClick={() => context.emit('onMoreClick')}>
					<Icon height="14" width="14" icon="fluent:more-vertical-20-regular" />
				</button>
			</div>
			<div class="cell_body">{context.slots?.default?.()}</div>
		</div>
	)
}

// connection info cell item component
function CellItem(props: { label?: string; value?: string }, context: SetupContext) {
	return (
		<div class="cell_body_item">
			<div class="cell_body_item_label">
				{context.slots?.label ? context.slots.label() : <TextEllipsis content={props.label} />}
			</div>
			<div class="cell_body_item_value">
				{context.slots?.value ? context.slots.value() : <TextEllipsis content={props.value} />}
			</div>
		</div>
	)
}

// more click
const infoDialogRef = ref<InstanceType<typeof InfoDialog>>()
function handleMoreClick(type: keyof ConnectionInfo, icon: string) {
	infoDialogRef.value.open(icon, type)
}
</script>

<style scoped lang="scss">
.overview_header {
	&:hover {
		:deep(.t-swiper__arrow-left),
		:deep(.t-swiper__arrow-right) {
			visibility: visible;
			opacity: 1;
		}
	}

	.cells {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--td-comp-margin-m);

		:deep(.cell) {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: var(--td-comp-paddingTB-xs);
			overflow: hidden;
		}

		:deep(.cell_header) {
			display: flex;
			justify-content: space-between;
			gap: var(--td-comp-margin-xs);
		}

		:deep(.cell_header_prefix) {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-xs);
		}

		:deep(.cell_header_prefix_icon) {
			color: var(--td-brand-color);
		}

		:deep(.cell_header_prefix_title) {
			font: var(--td-font-body-medium);
			color: var(--td-text-color-secondary);
		}

		:deep(.cell_header_suffix) {
			display: flex;
			align-items: center;
			gap: var(--td-comp-margin-xs);
			border: none;
			background-color: transparent;
			color: var(--td-text-color-secondary);
			font: var(--td-font-body-medium);
			border-radius: var(--td-radius-default);
			cursor: pointer;
			transition: var(--td-transition);
			--ripple-color: var(--td-bg-color-secondarycontainer-active);

			&:hover {
				color: var(--td-text-color-primary);
				background-color: var(--td-bg-color-container-active);
			}
		}

		:deep(.cell_body) {
			flex: 1;
			background-color: var(--td-bg-color-container);
			border-radius: var(--td-radius-medium);
			padding: var(--td-comp-paddingLR-m);
			overflow: hidden;
		}

		:deep(.cell_body_item) {
			display: flex;
			gap: var(--td-comp-margin-m);
			font: var(--td-font-body-medium);
			padding: var(--td-comp-paddingTB-xs) 0;
		}

		:deep(.cell_body_item_label) {
			color: var(--td-text-color-secondary);
			max-width: 70%;
			overflow: hidden;
		}

		:deep(.cell_body_item_value) {
			flex: 1;
			text-align: left;
			color: var(--td-brand-color);
			overflow: hidden;
		}
	}

	:deep(.t-swiper__navigation) {
		display: none;
	}

	:deep(.t-swiper__arrow-left),
	:deep(.t-swiper__arrow-right) {
		background-color: var(--td-bg-color-container);
		border: 1px solid var(--td-component-border);
		border-radius: var(--td-radius-medium);
		color: var(--td-text-color-primary);
		box-shadow: var(--td-shadow-3);
		visibility: hidden;
		opacity: 0;
		transition: all var(--td-transition);

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}
	}
}
</style>
