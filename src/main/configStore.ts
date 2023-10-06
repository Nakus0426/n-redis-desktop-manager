import Store from 'electron-store'
import { type NativeTheme } from 'electron'

export interface ConfigStore {
	appTheme: NativeTheme['themeSource']
	appMicaConfig: boolean
}

export const configStore = new Store<ConfigStore>()
