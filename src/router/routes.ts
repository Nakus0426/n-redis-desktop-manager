import { RouteRecordRaw } from 'vue-router'

// links
export const LinksIndexRoute: RouteRecordRaw = {
	name: 'LinksIndex',
	path: '/links',
	component: () => import('@/views/links/Index.vue'),
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
	redirect: LinksIndexRoute,
	component: () => import('@/layout/Layout.vue'),
	children: [LinksIndexRoute, TerminalIndexRoute],
}

// common setting
export const CommonSettingRoute: RouteRecordRaw = {
	name: 'CommonSetting',
	path: '/setting/common',
	component: () => import('@/views/setting/Common.vue'),
}

// appearance setting
export const AppearanceSettingRoute: RouteRecordRaw = {
	name: 'AppearanceSetting',
	path: '/setting/appearance',
	component: () => import('@/views/setting/Appearance.vue'),
}

// setting
export const SettingRoute: RouteRecordRaw = {
	name: 'Setting',
	path: '/setting',
	redirect: CommonSettingRoute,
	component: () => import('@/views/setting/Index.vue'),
	children: [CommonSettingRoute, AppearanceSettingRoute],
}

export const routes = [IndexRoute, SettingRoute]
