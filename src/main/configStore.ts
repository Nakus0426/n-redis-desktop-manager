import Store from 'electron-store'
import { type NativeTheme } from 'electron'

/** app config */
export interface ConfigStore {
	theme: NativeTheme['themeSource']
	mica: boolean
}

export const configStore = new Store<ConfigStore>()
