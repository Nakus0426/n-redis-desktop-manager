<template>
	<OnlyChild @contextmenu="handleRightClick">
		<slot name="default" />
	</OnlyChild>
	<Teleport to="body">
		<Transition name="menu-in">
			<div class="menu" ref="menuRef" :style="floatingStyles" v-if="menuVisible">
				<template v-for="(item, index) in options" :key="item.value">
					<div class="menu_item" :class="`is-${item.theme}`" v-ripple @click="handleMenuItemClick(item.value)">
						<Icon height="16" width="16" :icon="item.icon" v-if="item?.icon" />
						<span>{{ item.label }}</span>
					</div>
					<div class="menu_item_divider" v-if="index !== options.length - 1 && item.divider" />
				</template>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { useFloating, flip } from '@floating-ui/vue'
import { type DropdownItemTheme } from 'tdesign-vue-next'
import { useForwardRef } from '@/hooks/useForwardRef'
import { OnlyChild } from './OnlyChild'

export type ContextMenuOption = {
	icon?: string
	label: string
	value: string | number
	divider?: boolean
	theme?: DropdownItemTheme
}
const props = defineProps<{ options: ContextMenuOption[] }>()
const emit = defineEmits<{ select: [ContextMenuOption['value']] }>()

const triggerRef = ref()
useForwardRef(triggerRef)

const menuRef = ref<HTMLElement>()
const visualTriggerRef = ref()
const { floatingStyles } = useFloating(visualTriggerRef, menuRef, {
	placement: 'right-start',
	strategy: 'fixed',
	middleware: [flip()],
})

const menuVisible = ref(false)
function handleRightClick({ clientX, clientY }: MouseEvent) {
	visualTriggerRef.value = {
		getBoundingClientRect() {
			return {
				left: clientX,
				top: clientY,
				right: clientX,
				bottom: clientY,
				x: clientX,
				y: clientY,
				width: 0,
				height: 0,
			}
		},
	}
	menuVisible.value = true
}

document.addEventListener('mousedown', handleMenuUnFocus)
document.addEventListener('wheel', handleMenuUnFocus)
function handleMenuUnFocus(e: MouseEvent) {
	if (!menuVisible.value || menuRef.value?.contains(e.target as Node)) return
	menuVisible.value = false
}

function handleMenuItemClick(value: ContextMenuOption['value']) {
	menuVisible.value = false
	emit('select', value)
}
</script>

<style scoped lang="scss">
.menu {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-xxs);
	background-color: var(--td-bg-color-container-opacity);
	backdrop-filter: blur(15px);
	border-radius: var(--td-radius-medium);
	border: 0.5px solid var(--td-component-stroke);
	padding: var(--td-pop-padding-m);
	box-shadow: var(--td-shadow-2);
	z-index: 5500;

	&_item {
		display: flex;
		align-items: center;
		gap: var(--td-comp-margin-s);
		color: var(--td-text-color-primary);
		border-radius: var(--td-radius-default);
		font: var(--td-font-body-medium);
		user-select: none;
		transition: all var(--td-transition);
		padding: calc(var(--td-comp-paddingTB-xs) - 1px) var(--td-comp-paddingLR-s);
		cursor: pointer;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover {
			background-color: var(--td-bg-color-container-hover);
		}

		&.is-success {
			color: var(--td-success-color);
		}

		&.is-warning {
			color: var(--td-warning-color);
		}

		&.is-error {
			color: var(--td-error-color);
		}

		&_divider {
			height: 1px;
			background-color: var(--td-component-stroke);
			margin: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-s);
		}
	}
}

@keyframes menuIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.menu-in-enter-active {
	animation: menuIn var(--td-transition);
}
.menu-in-leave-active {
	animation: none;
}
</style>
