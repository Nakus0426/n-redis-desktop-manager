<template>
	<div class="empty" :class="clazz">
		<img class="empty_icon" draggable="false" :src="iconSrc" />
		<div class="empty_description">{{ description }}</div>
	</div>
</template>

<script setup lang="ts">
import logo from '@/assets/icons/logo-solid.svg'
import emptyInbox from '@/assets/icons/nothing-here.svg'
import nothingHere from '@/assets/icons/empty-inbox.svg'
import addToInbox from '@/assets/icons/add-to-inbox.svg'
import noContent from '@/assets/icons/no-content.svg'
import logoDark from '@/assets/icons/logo-solid-dark.svg'
import emptyInboxDark from '@/assets/icons/nothing-here-dark.svg'
import nothingHereDark from '@/assets/icons/empty-inbox-dark.svg'
import addToInboxDark from '@/assets/icons/add-to-inbox-dark.svg'
import noContentDark from '@/assets/icons/no-content-dark.svg'
import { useAppStore } from '@/store'

defineOptions({ name: 'Empty' })

const appStore = useAppStore()

type Icon = 'emptyInbox' | 'nothingHere' | 'addToInbox' | 'noContent' | 'logo'
type Size = 'medium' | 'large'
const props = withDefaults(
	defineProps<{
		icon?: Icon | string
		size?: Size
		description?: string
		clickable?: boolean
	}>(),
	{
		icon: 'noContent',
		size: 'medium',
		description: '暂无数据',
		clickable: false,
	}
)

const iconLightSrcMap = { emptyInbox, nothingHere, addToInbox, noContent, logo }
const iconDarkSrcMap = {
	emptyInbox: emptyInboxDark,
	nothingHere: nothingHereDark,
	addToInbox: addToInboxDark,
	noContent: noContentDark,
	logo: logoDark,
}
const iconSrc = computed(() => {
	if (appStore.theme === 'light') return iconLightSrcMap[props.icon]
	if (appStore.theme === 'dark') return iconDarkSrcMap[props.icon]
	if (appStore.theme === 'system')
		return (window.mainWindow.getAppTheme() === 'light' ? iconLightSrcMap : iconDarkSrcMap)[props.icon]
})
const clazz = computed(() => `empty-${props.size} ${props.clickable ? 'empty-clickable' : ''}`)
</script>

<style scoped lang="scss">
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--td-comp-margin-m);

	&-medium {
		.empty_icon {
			height: 64px;
		}

		.empty_description {
			font: var(--td-font-body-small);
		}
	}

	&-large {
		.empty_icon {
			height: 96px;
		}

		.empty_description {
			font: var(--td-font-body-medium);
		}
	}

	&-clickable {
		cursor: pointer;
	}

	&_icon {
		pointer-events: none;
	}

	&_description {
		color: var(--td-text-color-placeholder);
	}
}
</style>
