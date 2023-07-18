import { RouteRecordRaw } from 'vue-router'

// links
export const LinksIndexRoute: RouteRecordRaw = {
	name: 'LinksIndex',
	path: '/links',
	component: () => import('@/views/links/Index.vue'),
}

// Terminal
export const TerminalIndexRoute: RouteRecordRaw = {
	name: 'TerminalIndex',
	path: '/terminal',
	component: () => import('@/views/terminal/Index.vue'),
}

export const IndexRoute: RouteRecordRaw = {
	name: 'Index',
	path: '/',
	redirect: LinksIndexRoute,
	component: () => import('@/layout/Layout.vue'),
	children: [LinksIndexRoute, TerminalIndexRoute],
}

export const ChildRoute: RouteRecordRaw = {
	name: 'child',
	path: '/child',
	component: () => import('@/views/terminal/Index.vue'),
}

export const routes = [IndexRoute, ChildRoute]
