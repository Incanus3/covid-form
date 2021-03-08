import _ from 'lodash'

import { camelToSnakeCase, keysToCamelCase } from './generic'
import { AsyncResult          } from './results'
import { Setting, JSONData    } from 'src/models'
import { SettingCRUDService   } from 'src/services/crud'
import { ERROR_CODE_NOT_FOUND } from 'src/constants'

export type Settings = Record<string, any>

export function settingsToObject(settings: Setting[]): Settings {
  return keysToCamelCase(_.fromPairs(
    settings.map((setting) => [setting.key, setting.value])
  ))
}

export async function loadSettings(
  service: SettingCRUDService, setter: (settings: Settings) => void
): Promise<void> {
  (await service.loadAll()).onSuccess(async (settings: Setting[]) => {
    setter(settingsToObject(settings))
  })
}

export async function saveSetting(service: SettingCRUDService, { key, value }: Setting): Promise<AsyncResult<Setting, any>> {
  key = camelToSnakeCase(key)

  let result = await service.update(key, new Setting({ key, value }))

  await result.onFailure(async (data: JSONData) => {
    if (data.code === ERROR_CODE_NOT_FOUND) {
      result = await service.create(new Setting({ key, value }))
    }
  })

  return result
}
