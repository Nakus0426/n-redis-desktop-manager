import { RouteRecordRaw } from 'vue-router'

const IndexRouter: RouteRecordRaw = {
	name: 'Index',
	path: '/',
	component: () => import('@/layout/Layout.vue'),
	children: [],
}

export const routes = [IndexRouter]
