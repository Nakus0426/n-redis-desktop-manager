<template>
	<div class="appearance">
		<Cell :title="t('setting.appearance.theme.title')">
			<div class="themes">
				<div class="theme" :class="isThemeActived('system')">
					<div class="theme_icon system" @click="handleThemeClick('system')"></div>
					<div class="theme_title">{{ t('setting.appearance.theme.system') }}</div>
				</div>
				<div class="theme" :class="isThemeActived('light')">
					<div class="theme_icon light" @click="handleThemeClick('light')"></div>
					<div class="theme_title">{{ t('setting.appearance.theme.light') }}</div>
				</div>
				<div class="theme" :class="isThemeActived('dark')">
					<div class="theme_icon dark" @click="handleThemeClick('dark')"></div>
					<div class="theme_title">{{ t('setting.appearance.theme.dark') }}</div>
				</div>
			</div>
		</Cell>
		<Cell title="其他">
			<CellItem label="云母效果" desc="仅 Windows 11 可用，重启后生效">
				<TSwitch size="large" v-model="appStore.micaEnable" />
			</CellItem>
		</Cell>
	</div>
</template>

<script setup lang="ts">
import { useLocale } from '@/hooks'
import { Theme, useAppStore } from '@/store'
import { Cell, CellItem } from './components'

defineOptions({ name: 'SettingAppearance' })

const appStore = useAppStore()
const { t } = useLocale(false)

// is theme actived
function isThemeActived(theme: Theme) {
	return appStore.theme === theme ? 'is-actived' : ''
}

// theme switch
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
}

.themes {
	display: flex;
	gap: var(--td-comp-margin-m);

	.theme {
		display: flex;
		flex-direction: column;
		border-radius: var(--td-radius-medium);

		&_icon {
			height: 80px;
			width: 128px;
			border-radius: var(--td-radius-medium);
			border: 1px solid var(--td-component-stroke);
			outline: solid 2px transparent;
			transition: outline var(--td-transition);
			cursor: pointer;

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
}
</style>
