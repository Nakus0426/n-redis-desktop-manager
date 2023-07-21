<template>
	<div class="appearance">
		<div class="cell">
			<div class="cell_title">主题设置</div>
			<div class="cell_content cell_content-horizontal">
				<div class="theme is-actived" v-ripple>
					<div class="theme_icon"></div>
					<div class="theme_title">跟随系统</div>
				</div>
				<div class="theme" v-ripple>
					<div class="theme_icon"></div>
					<div class="theme_title">日间模式</div>
				</div>
				<div class="theme" v-ripple>
					<div class="theme_icon"></div>
					<div class="theme_title">夜间模式</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.appearance {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-m);
	padding: var(--td-comp-paddingTB-m);
}

.cell {
	display: flex;
	flex-direction: column;
	gap: var(--td-comp-margin-s);

	&_title {
		font: var(--td-font-body-medium);
		color: var(--td-text-color-secondary);
	}

	&_content {
		display: flex;
		border-radius: var(--td-radius-medium);
		background-color: var(--td-bg-color-container);
		padding: var(--td-comp-paddingTB-s);

		&-horizontal {
			flex-direction: row;
			gap: var(--td-comp-margin-m);
		}

		&-vertical {
			flex-direction: column;
		}
	}
}

.theme {
	display: flex;
	flex-direction: column;
	border-radius: var(--td-radius-medium);
	padding: var(--td-comp-paddingTB-s) var(--td-comp-paddingTB-s) 0 var(--td-comp-paddingTB-s);
	transition: 0.2s var(--td-transition);
	cursor: pointer;
	--ripple-color: var(--td-bg-color-container-active);

	&_icon {
		height: 80px;
		width: 128px;
		border-radius: var(--td-radius-medium);
		border: 2px solid transparent;
	}

	&_title {
		font: var(--td-font-body-small);
		color: var(--td-text-color-secondary);
	}

	&:hover {
		background-color: var(--td-bg-color-container-hover);
	}

	&.is-actived .theme_icon {
		border-color: var(--td-brand-color);
	}
}
</style>
