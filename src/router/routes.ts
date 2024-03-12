import { RouteRecordRaw } from 'vue-router'

const IndexRoute: RouteRecordRaw = {
	path: '/',
	name: 'Index',
	component: () => import('@/layout/MainLayout.vue'),
}

export const routes = [IndexRoute]
