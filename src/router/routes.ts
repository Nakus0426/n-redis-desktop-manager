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

// setting
export const SettingRoute: RouteRecordRaw = {
	name: 'Setting',
	path: '/setting',
	component: () => import('@/views/setting/Index.vue'),
}

export const routes = [IndexRoute, SettingRoute]
