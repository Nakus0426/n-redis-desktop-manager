import { acceptHMRUpdate, defineStore } from 'pinia'

/**
 * app store
 */
export const useAppStore = defineStore('APP', () => {})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
