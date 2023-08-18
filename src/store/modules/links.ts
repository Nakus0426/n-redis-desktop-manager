import { acceptHMRUpdate, defineStore } from 'pinia'
import localForage from 'localforage'
import { cloneDeep } from 'lodash-es'

export interface Link {
	id: string
	name: string
	host: string
	port: number
	username: string
	password: string
	separator: string
	top?: boolean
	connected?: boolean
}

enum LinkKeys {
	NormalLinks = 'normalLinks',
	TopLinks = 'topLinks',
}

/**
 * links store
 */
export const useLinksStore = defineStore('Links', () => {
	/**
	 * array of links
	 */
	const links = computed<Link[]>(() => topLinks.value.concat(normalLinks.value))

	/**
	 * array of top links
	 */
	const topLinks = ref<Link[]>([])

	/**
	 * array of normal links
	 */
	const normalLinks = ref<Link[]>([])

	/**
	 *  sync stored links data
	 */
	async function syncLinks() {
		const storedNormalLiks = await localForage.getItem<string>(LinkKeys.NormalLinks)
		const storedTopLiks = await localForage.getItem<string>(LinkKeys.TopLinks)
		normalLinks.value = storedNormalLiks ? JSON.parse(storedNormalLiks) : []
		topLinks.value = storedTopLiks ? JSON.parse(storedTopLiks) : []
	}

	/**
	 * add links
	 */
	async function addLinks(link: Link) {
		const clonedLinks = cloneDeep(normalLinks.value)
		clonedLinks.push(link)
		const res = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedLinks))
		if (res) normalLinks.value = clonedLinks
	}

	/**
	 * remove link
	 */
	async function removeLink(id: string) {
		const clonedLinks = cloneDeep(normalLinks.value)
		const linkIndex = clonedLinks.findIndex(link => link.id === id)
		clonedLinks.splice(linkIndex, 1)
		const res = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedLinks))
		if (res) normalLinks.value = clonedLinks
	}

	/**
	 * update link
	 */
	async function updateLink(link: Link) {
		const clonedLinks = cloneDeep(link.top ? topLinks.value : normalLinks.value)
		const linkIndex = clonedLinks.findIndex(item => item.id === link.id)
		clonedLinks.splice(linkIndex, 1, link)
		const res = await localForage.setItem(
			link.top ? LinkKeys.TopLinks : LinkKeys.NormalLinks,
			JSON.stringify(clonedLinks)
		)
		if (res) {
			if (link.top) topLinks.value = clonedLinks
			else normalLinks.value = clonedLinks
		}
	}

	/**
	 * placing link on top
	 */
	async function topLink(id: string) {
		const clonedTopLinks = cloneDeep(topLinks.value)
		const clonedNormalLinks = cloneDeep(normalLinks.value)
		const linkIndex = clonedNormalLinks.findIndex(link => link.id === id)
		const link = normalLinks.value[linkIndex]
		link.top = true
		clonedTopLinks.push(link)
		const addTopLinkRes = await localForage.setItem(LinkKeys.TopLinks, JSON.stringify(clonedTopLinks))
		if (addTopLinkRes) topLinks.value = clonedTopLinks
		clonedNormalLinks.splice(linkIndex, 1)
		const removeNormalLinkRes = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedNormalLinks))
		if (removeNormalLinkRes) normalLinks.value.splice(linkIndex, 1)
	}

	/**
	 * cancel placing link on top
	 */
	async function cancelTopLink(id: string) {
		const clonedTopLinks = cloneDeep(topLinks.value)
		const clonedNormalLinks = cloneDeep(normalLinks.value)
		const linkIndex = clonedTopLinks.findIndex(link => link.id === id)
		const link = topLinks.value[linkIndex]
		link.top = false
		clonedNormalLinks.push(link)
		const addNormalLinkRes = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedNormalLinks))
		if (addNormalLinkRes) normalLinks.value = clonedNormalLinks
		clonedTopLinks.splice(linkIndex, 1)
		const removeTopLinkRes = await localForage.setItem(LinkKeys.TopLinks, JSON.stringify(clonedTopLinks))
		if (removeTopLinkRes) topLinks.value.splice(linkIndex, 1)
	}

	/**
	 * connect link
	 */
	async function connectLink(id: string) {
		const link = links.value.find(link => link.id === id)
		const { host, port, username, password } = cloneDeep(link)
		const url = `redis://${host}:${String(port)}`
		await window.mainWindow.redis.create({
			id,
			url,
			username,
			password,
			socket: { reconnectStrategy: retries => (retries > 20 ? false : 500) },
		})
		await window.mainWindow.redis.connect(id)
	}

	/**
	 * disconnect link
	 */
	async function disconnectLink(id: string) {
		await window.mainWindow.redis.disconnect(id)
		const link = links.value.find(link => link.id === id)
		link.connected = false
	}

	/**
	 * handle redis ready event
	 */
	window.mainWindow.redis.onReady(id => {
		const link = links.value.find(link => link.id === id)
		link.connected = true
	})

	return { links, syncLinks, addLinks, removeLink, updateLink, topLink, cancelTopLink, connectLink, disconnectLink }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useLinksStore, import.meta.hot))
