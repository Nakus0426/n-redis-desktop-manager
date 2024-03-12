<template>
	<NElement class="main-layout">
		<div class="sidebar">
			<div class="logo">
				<Icon height="32" width="32" icon="custom-logo" />
			</div>
			<template v-for="item in 10">
				<div class="menu">123</div>
			</template>
		</div>
		<div class="main"></div>
	</NElement>
</template>

<script setup lang="ts"></script>

<style scoped>
.main-layout {
	height: 100%;
	width: 100%;
	display: flex;
}

.sidebar {
	width: 50px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 4px;
	gap: 4px;

	.logo {
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.main {
	flex: 1;
}
</style>
