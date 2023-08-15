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
}

enum LinkKeys {
	NormalLinks = 'normalLinks',
	TopLinks = 'topLinks',
}

/**
 * links store
 */
export const useLinksStore = defineStore('Links', () => {
	const links = computed<Link[]>(() => topLinks.value.concat(normalLinks.value))
	const topLinks = ref<Link[]>([])
	const normalLinks = ref<Link[]>([])

	/** sync stored links data */
	async function syncLinks() {
		const storedNormalLiks = await localForage.getItem<string>(LinkKeys.NormalLinks)
		const storedTopLiks = await localForage.getItem<string>(LinkKeys.TopLinks)
		normalLinks.value = storedNormalLiks ? JSON.parse(storedNormalLiks) : []
		topLinks.value = storedTopLiks ? JSON.parse(storedTopLiks) : []
	}

	/** add links */
	async function addLinks(link: Link) {
		const clonedLinks = cloneDeep(normalLinks.value)
		clonedLinks.push(link)
		const res = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedLinks))
		if (res) normalLinks.value = clonedLinks
	}

	/** remove link */
	async function removeLink(id: string) {
		const clonedLinks = cloneDeep(normalLinks.value)
		const linkIndex = clonedLinks.findIndex(link => link.id === id)
		clonedLinks.splice(linkIndex, 1)
		const res = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedLinks))
		if (res) normalLinks.value = clonedLinks
	}

	/** placing link on top */
	async function topLink(id: string) {
		const clonedNormalLinks = cloneDeep(normalLinks.value)
		const linkIndex = clonedNormalLinks.findIndex(link => link.id === id)
		clonedNormalLinks.splice(linkIndex, 1)
		const removeNormalLinkRes = await localForage.setItem(LinkKeys.NormalLinks, JSON.stringify(clonedNormalLinks))
		if (removeNormalLinkRes) normalLinks.value.splice(linkIndex, 1)

		const clonedTopLinks = cloneDeep(topLinks.value)
		const link = normalLinks.value[linkIndex]
		clonedTopLinks.push(link)
		const addTopLinkRes = await localForage.setItem(LinkKeys.TopLinks, JSON.stringify(clonedTopLinks))
		if (addTopLinkRes) topLinks.value = clonedTopLinks
	}

	return { links, syncLinks, addLinks, removeLink, topLink }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useLinksStore, import.meta.hot))
