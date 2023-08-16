<template>
	<div class="appearance">
		<Cell title="主题设置">
			<div class="theme" :class="isThemeActived('system')" v-ripple>
				<div class="theme_icon system" v-ripple @click="handleThemeClick('system')"></div>
				<div class="theme_title">跟随系统</div>
			</div>
			<div class="theme" :class="isThemeActived('light')">
				<div class="theme_icon light" v-ripple @click="handleThemeClick('light')"></div>
				<div class="theme_title">日间模式</div>
			</div>
			<div class="theme" :class="isThemeActived('dark')">
				<div class="theme_icon dark" v-ripple @click="handleThemeClick('dark')"></div>
				<div class="theme_title">夜间模式</div>
			</div>
		</Cell>
		<!-- <div class="cell">
			<div class="cell_title">主题设置</div>
			<div class="cell_content cell_content-horizontal">
				
			</div>
		</div> -->
	</div>
</template>

<script setup lang="ts">
import Cell from './modules/Cell'
import { Theme, useAppStore } from '@/store'

const appStore = useAppStore()

function isThemeActived(theme: Theme) {
	return appStore.theme === theme ? 'is-actived' : ''
}

function handleThemeClick(theme: Theme) {
	appStore.setTheme(theme)
}
</script>

<style scoped lang="scss">
.appearance {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-m);
	padding: var(--td-comp-paddingTB-m);
}

.theme {
	display: flex;
	flex-direction: column;
	border-radius: var(--td-radius-medium);
	// padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-s) 0 var(--td-comp-paddingTB-s);

	&_icon {
		height: 80px;
		width: 128px;
		border-radius: var(--td-radius-medium);
		border: 1px solid var(--td-component-stroke);
		outline: solid 2px transparent;
		transition: outline var(--td-transition);
		cursor: pointer;
		--ripple-color: var(--td-bg-color-container-active);

		&:hover {
			outline: solid 2px var(--td-brand-color-focus);
		}

		&.system {
			background: url(@/assets/images/theme_system.svg) no-repeat center center;
		}

		&.light {
			background: url(@/assets/images/theme_light.svg) no-repeat center center;
		}

		&.dark {
			background: url(@/assets/images/theme_dark.svg) no-repeat center center;
		}
	}

	&_title {
		font: var(--td-font-body-small);
		color: var(--td-text-color-secondary);
	}

	&.is-actived .theme_icon {
		border: 2px solid var(--td-brand-color);
	}
}
</style>
