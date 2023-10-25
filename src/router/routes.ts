import { RouteRecordRaw } from 'vue-router'

// connections
export const ConnectionsIndexRoute: RouteRecordRaw = {
	name: 'ConnectionsIndex',
	path: '/connections',
	component: () => import('@/views/connections/Index.vue'),
}

// terminal
export const TerminalIndexRoute: RouteRecordRaw = {
	name: 'TerminalIndex',
	path: '/terminal',
	component: () => import('@/views/terminal/Index.vue'),
}

// index
export const IndexRoute: RouteRecordRaw = {
	name: 'Index',
	path: '/',
	redirect: ConnectionsIndexRoute,
	component: () => import('@/layout/Layout.vue'),
	children: [ConnectionsIndexRoute, TerminalIndexRoute],
}

// common setting
export const CommonSettingRoute: RouteRecordRaw = {
	name: 'CommonSetting',
	path: '/setting/common',
	component: () => import('@/views/setting/Common.vue'),
	meta: { title: 'setting.common.title' },
}

// appearance setting
export const AppearanceSettingRoute: RouteRecordRaw = {
	name: 'AppearanceSetting',
	path: '/setting/appearance',
	component: () => import('@/views/setting/Appearance.vue'),
	meta: { title: 'setting.appearance.title' },
}

// function setting
export const FunctionSettingRoute: RouteRecordRaw = {
	name: 'FunctionSetting',
	path: '/setting/function',
	component: () => import('@/views/setting/Function.vue'),
	meta: { title: 'setting.function.title' },
}

// setting
export const SettingRoute: RouteRecordRaw = {
	name: 'Setting',
	path: '/setting',
	redirect: CommonSettingRoute,
	component: () => import('@/views/setting/Index.vue'),
	children: [CommonSettingRoute, AppearanceSettingRoute, FunctionSettingRoute],
}

export const routes = [IndexRoute, SettingRoute]
